# GitHub Actions 发版 Workflow 整理

## 目标

整理一套常用的 GitHub Actions 发版流程，适合“代码推到 `main` 后自动构建镜像、推送镜像仓库、SSH 到服务器发版”的场景。

本文重点放在 Docker Compose 单机部署，并把蓝绿发布整理进去：

```text
GitHub Actions
  -> 拉代码
  -> 测试和构建
  -> 构建 Docker 镜像
  -> 推送镜像仓库
  -> SSH 到服务器
  -> 启动非当前颜色环境
  -> 健康检查
  -> 切换 Nginx 流量
  -> 保留旧环境用于回滚
```

## 基础概念

### 普通发版

普通发版通常是：

```text
拉新镜像 -> 停旧容器 -> 起新容器 -> 重载 Nginx
```

问题是中间可能有短暂不可用。如果新容器启动失败，旧容器已经被停掉，回滚也比较被动。

### 蓝绿发布

蓝绿发布会准备两套运行环境：

```text
blue   当前对外提供服务
green  新版本先启动和检查
```

新版本在非当前环境启动，健康检查通过后再把 Nginx upstream 或宿主机 `proxy_pass` 端口切到新环境。旧环境不马上删除，方便快速回滚。

## 推荐目录结构

服务器上建议放在 `/opt/myapp`，目录如下：

```text
/opt/myapp
├── compose
│   ├── docker-compose.blue.yml
│   └── docker-compose.green.yml
├── nginx
│   ├── app.conf
│   └── upstream.conf
├── scripts
│   ├── deploy-blue-green.sh
│   └── rollback-blue-green.sh
└── state
    └── current_color
```

说明：

- `current_color` 保存当前对外服务颜色，值为 `blue` 或 `green`。
- `upstream.conf` 由脚本生成，Nginx 主配置通过 `include` 引入。
- blue 和 green 使用不同容器名、不同宿主机端口。

## GitHub 配置

### Repository Secrets

进入 GitHub 仓库：

```text
Settings -> Secrets and variables -> Actions -> Secrets
```

建议配置：

| 名称 | 用途 |
| --- | --- |
| `SSH_HOST` | 服务器 IP 或域名 |
| `SSH_PORT` | SSH 端口，例如 `22` |
| `SSH_USER` | 发版用户 |
| `SSH_PRIVATE_KEY` | GitHub Actions 使用的私钥 |
| `SSH_KNOWN_HOSTS` | 服务器 SSH host key，避免发版时临时信任首次连接 |
| `REGISTRY_USERNAME` | 镜像仓库用户名 |
| `REGISTRY_PASSWORD` | 镜像仓库密码或 Token |

如果使用 GitHub Container Registry，并且镜像推到当前仓库，也可以使用默认 `GITHUB_TOKEN`。如果使用 Docker Hub，密码建议使用 Docker Hub access token，不要使用登录密码。

`SSH_KNOWN_HOSTS` 可以用 `ssh-keyscan -p 22 example.com` 生成，但要先通过云厂商控制台、服务器控制台或已有可信连接核对指纹。不要在 workflow 里直接 `ssh-keyscan` 后立即信任结果，否则第一次连接可能被中间人攻击。

还要注意：`docker/login-action` 只让 GitHub runner 能推镜像，不会让服务器自动拥有拉镜像权限。服务器执行 `docker compose pull` 或 `docker pull` 前也必须能登录镜像仓库。可以首次在服务器手动 `docker login`，更推荐像下面 workflow 一样在 deploy job 中用 `docker login --password-stdin` 登录服务器侧 Docker。

### Repository Variables

进入：

```text
Settings -> Secrets and variables -> Actions -> Variables
```

建议配置：

| 名称 | 示例 | 用途 |
| --- | --- | --- |
| `REGISTRY` | `ghcr.io` | 镜像仓库地址 |
| `IMAGE_NAME` | `owner/myapp` | 镜像名 |
| `APP_DIR` | `/opt/myapp` | 服务器部署目录 |
| `HEALTH_PATH` | `/api/health` | 新蓝绿端口的本地健康检查路径 |
| `PUBLIC_HEALTH_URL` | `https://example.com/api/health` | 可选，切流后的公网健康检查地址 |

## Workflow 示例

文件路径：

```text
.github/workflows/deploy-prod.yml
```

::: details deploy-prod.yml

```yaml
name: Deploy production

on:
  push:
    branches:
      - main
  workflow_dispatch:
    inputs:
      image_tag:
        description: "手动指定镜像 tag，留空则使用当前 commit SHA"
        required: false
        type: string

concurrency:
  group: deploy-production
  cancel-in-progress: false

permissions:
  contents: read
  packages: write

env:
  REGISTRY: ${{ vars.REGISTRY }}
  IMAGE_NAME: ${{ vars.IMAGE_NAME }}
  APP_DIR: ${{ vars.APP_DIR }}
  HEALTH_PATH: ${{ vars.HEALTH_PATH || '/api/health' }}
  PUBLIC_HEALTH_URL: ${{ vars.PUBLIC_HEALTH_URL || '' }}

jobs:
  build:
    name: Build and push image
    runs-on: ubuntu-latest
    outputs:
      image: ${{ steps.meta.outputs.image }}
      tag: ${{ steps.meta.outputs.tag }}
    steps:
      - name: Ensure production release uses main
        shell: bash
        run: |
          set -euo pipefail
          if [ "${GITHUB_REF_NAME}" != "main" ]; then
            echo "Production releases must run from main; got ${GITHUB_REF_NAME}." >&2
            exit 1
          fi

      - name: Checkout
        uses: actions/checkout@v4

      - name: Resolve image metadata
        id: meta
        shell: bash
        env:
          INPUT_TAG: ${{ github.event.inputs.image_tag || '' }}
        run: |
          set -euo pipefail

          if [ -n "${INPUT_TAG:-}" ]; then
            TAG="$INPUT_TAG"
          else
            TAG="${GITHUB_SHA::12}"
          fi

          if [[ ! "$TAG" =~ ^[A-Za-z0-9_.-]{1,128}$ ]]; then
            echo "Invalid Docker tag: ${TAG}" >&2
            exit 1
          fi

          IMAGE="${REGISTRY}/${IMAGE_NAME}"
          if [[ ! "$IMAGE" =~ ^[A-Za-z0-9._:/-]+$ ]]; then
            echo "Invalid Docker image reference: ${IMAGE}" >&2
            exit 1
          fi
          echo "tag=${TAG}" >> "$GITHUB_OUTPUT"
          echo "image=${IMAGE}" >> "$GITHUB_OUTPUT"

      - name: Login registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ secrets.REGISTRY_USERNAME }}
          password: ${{ secrets.REGISTRY_PASSWORD }}

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build and push
        uses: docker/build-push-action@v6
        with:
          context: .
          file: ./Dockerfile
          push: true
          tags: |
            ${{ steps.meta.outputs.image }}:${{ steps.meta.outputs.tag }}
            ${{ steps.meta.outputs.image }}:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    name: Blue green deploy
    runs-on: ubuntu-latest
    needs: build
    environment:
      name: production
    steps:
      - name: Configure SSH
        shell: bash
        run: |
          set -euo pipefail
          mkdir -p ~/.ssh
          chmod 700 ~/.ssh
          echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key
          echo "${{ secrets.SSH_KNOWN_HOSTS }}" > ~/.ssh/known_hosts
          chmod 600 ~/.ssh/known_hosts

      - name: Deploy on server
        shell: bash
        env:
          REGISTRY_USERNAME: ${{ secrets.REGISTRY_USERNAME }}
          REGISTRY_PASSWORD: ${{ secrets.REGISTRY_PASSWORD }}
          DEPLOY_IMAGE: ${{ needs.build.outputs.image }}
          DEPLOY_TAG: ${{ needs.build.outputs.tag }}
        run: |
          set -euo pipefail
          username_b64="$(printf '%s' "$REGISTRY_USERNAME" | base64 | tr -d '\n')"
          password_b64="$(printf '%s' "$REGISTRY_PASSWORD" | base64 | tr -d '\n')"
          echo "::add-mask::$username_b64"
          echo "::add-mask::$password_b64"

          remote_env=(
            "REGISTRY=${REGISTRY}"
            "REGISTRY_USERNAME_B64=${username_b64}"
            "REGISTRY_PASSWORD_B64=${password_b64}"
            "IMAGE=${DEPLOY_IMAGE}"
            "TAG=${DEPLOY_TAG}"
            "APP_DIR=${APP_DIR}"
            "HEALTH_PATH=${HEALTH_PATH}"
            "PUBLIC_HEALTH_URL=${PUBLIC_HEALTH_URL}"
          )
          printf -v remote_command '%q ' env "${remote_env[@]}" bash "${APP_DIR}/scripts/deploy-blue-green.sh"
          ssh -i ~/.ssh/deploy_key \
            -p "${{ secrets.SSH_PORT }}" \
            "${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }}" \
            bash -lc "$remote_command"
```

:::

## 服务器 Compose 配置

blue 和 green 使用相同镜像，不同容器名和端口。

### docker-compose.blue.yml

::: details docker-compose.blue.yml

```yaml
services:
  app-blue:
    image: ${IMAGE}:${TAG}
    container_name: myapp-blue
    restart: unless-stopped
    ports:
      - "18081:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://127.0.0.1:8080/api/health"]
      interval: 10s
      timeout: 3s
      retries: 12
```

:::

### docker-compose.green.yml

::: details docker-compose.green.yml

```yaml
services:
  app-green:
    image: ${IMAGE}:${TAG}
    container_name: myapp-green
    restart: unless-stopped
    ports:
      - "18082:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://127.0.0.1:8080/api/health"]
      interval: 10s
      timeout: 3s
      retries: 12
```

:::

注意：

- 如果是前端 Nginx 镜像，把容器内端口改成 `80`。
- 如果是 FastAPI、Node、Java 服务，按实际容器端口改。
- `healthcheck` 里的 `wget` 要按镜像内实际工具调整；很多精简镜像没有 `wget`，可以改成镜像已有的 `curl`、应用自带命令，或只依赖宿主机发版脚本里的 `curl` 作为切流依据。
- 两套环境不要共用不可并发写的本地文件目录。
- 数据库迁移不要在 blue/green 两个容器里同时自动执行，建议在发版前单独跑 migration job。

## Nginx 配置

### app.conf

`/opt/myapp/nginx/app.conf`

::: details app.conf

```nginx
include /opt/myapp/nginx/upstream.conf;

server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://myapp_upstream;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/health {
        proxy_pass http://myapp_upstream/api/health;
        proxy_set_header Host $host;
    }
}
```

:::

### upstream.conf

初始可以先指向 blue：

```nginx
upstream myapp_upstream {
    server 127.0.0.1:18081;
}
```

把 `app.conf` 链接到 Nginx 配置目录：

```bash
sudo ln -s /opt/myapp/nginx/app.conf /etc/nginx/conf.d/myapp.conf
sudo nginx -t
sudo systemctl reload nginx
```

## 蓝绿发布脚本

文件路径：

```text
/opt/myapp/scripts/deploy-blue-green.sh
```

::: details deploy-blue-green.sh

```bash
#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/myapp}"
REGISTRY="${REGISTRY:?REGISTRY is required}"
IMAGE="${IMAGE:?IMAGE is required}"
TAG="${TAG:?TAG is required}"
HEALTH_PATH="${HEALTH_PATH:-/api/health}"
PUBLIC_HEALTH_URL="${PUBLIC_HEALTH_URL:-}"

STATE_DIR="${APP_DIR}/state"
COMPOSE_DIR="${APP_DIR}/compose"
NGINX_UPSTREAM="${APP_DIR}/nginx/upstream.conf"
CURRENT_FILE="${STATE_DIR}/current_color"

mkdir -p "$STATE_DIR"

if [[ ! "$TAG" =~ ^[A-Za-z0-9_.-]{1,128}$ ]]; then
  echo "invalid Docker tag: ${TAG}" >&2
  exit 1
fi

if [ -n "${REGISTRY_USERNAME_B64:-}" ] && [ -n "${REGISTRY_PASSWORD_B64:-}" ]; then
  registry_username="$(printf '%s' "$REGISTRY_USERNAME_B64" | base64 -d)"
  registry_password="$(printf '%s' "$REGISTRY_PASSWORD_B64" | base64 -d)"
  printf '%s' "$registry_password" | docker login "$REGISTRY" --username "$registry_username" --password-stdin
  unset registry_username registry_password
fi

current_color="$(cat "$CURRENT_FILE" 2>/dev/null || echo blue)"
if [ "$current_color" = "blue" ]; then
  next_color="green"
  next_port="18082"
  current_port="18081"
else
  next_color="blue"
  next_port="18081"
  current_port="18082"
fi

compose_file="${COMPOSE_DIR}/docker-compose.${next_color}.yml"

echo "current_color=${current_color}"
echo "next_color=${next_color}"
echo "image=${IMAGE}:${TAG}"

export IMAGE TAG

docker compose -f "$compose_file" pull
docker compose -f "$compose_file" up -d

echo "waiting for ${next_color} health check..."
for i in $(seq 1 60); do
  if curl -fsS "http://127.0.0.1:${next_port}${HEALTH_PATH}" >/dev/null; then
    echo "${next_color} is healthy"
    break
  fi

  if [ "$i" -eq 60 ]; then
    echo "${next_color} health check failed"
    docker compose -f "$compose_file" logs --tail=120
    exit 1
  fi

  sleep 2
done

old_upstream="$(mktemp)"
cleanup() {
  rm -f "$old_upstream"
}
trap cleanup EXIT

if [ -f "$NGINX_UPSTREAM" ]; then
  cp "$NGINX_UPSTREAM" "$old_upstream"
else
  cat > "$old_upstream" <<EOF
upstream myapp_upstream {
    server 127.0.0.1:${current_port};
}
EOF
fi

cat > "$NGINX_UPSTREAM" <<EOF
upstream myapp_upstream {
    server 127.0.0.1:${next_port};
}
EOF

if ! nginx -t; then
  cp "$old_upstream" "$NGINX_UPSTREAM"
  nginx -t || true
  exit 1
fi

if ! systemctl reload nginx; then
  cp "$old_upstream" "$NGINX_UPSTREAM"
  nginx -t && systemctl reload nginx || true
  exit 1
fi

if [ -n "$PUBLIC_HEALTH_URL" ] && ! curl --max-time 20 -fsS "$PUBLIC_HEALTH_URL" >/dev/null; then
  echo "public health check failed, restoring old upstream"
  cp "$old_upstream" "$NGINX_UPSTREAM"
  nginx -t
  systemctl reload nginx
  exit 1
fi

echo "$next_color" > "$CURRENT_FILE"

echo "traffic switched to ${next_color}"
echo "old ${current_color} is kept for rollback"
```

:::

授权：

```bash
chmod +x /opt/myapp/scripts/deploy-blue-green.sh
```

## 回滚脚本

文件路径：

```text
/opt/myapp/scripts/rollback-blue-green.sh
```

::: details rollback-blue-green.sh

```bash
#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/myapp}"
HEALTH_PATH="${HEALTH_PATH:-/api/health}"
STATE_DIR="${APP_DIR}/state"
NGINX_UPSTREAM="${APP_DIR}/nginx/upstream.conf"
CURRENT_FILE="${STATE_DIR}/current_color"

current_color="$(cat "$CURRENT_FILE" 2>/dev/null || echo blue)"
if [ "$current_color" = "blue" ]; then
  rollback_color="green"
  rollback_port="18082"
else
  rollback_color="blue"
  rollback_port="18081"
fi

if ! curl -fsS "http://127.0.0.1:${rollback_port}${HEALTH_PATH}" >/dev/null; then
  echo "rollback target ${rollback_color} is not healthy"
  exit 1
fi

cat > "$NGINX_UPSTREAM" <<EOF
upstream myapp_upstream {
    server 127.0.0.1:${rollback_port};
}
EOF

nginx -t
systemctl reload nginx

echo "$rollback_color" > "$CURRENT_FILE"
echo "rollback traffic to ${rollback_color}"
```

:::

授权：

```bash
chmod +x /opt/myapp/scripts/rollback-blue-green.sh
```

执行回滚：

```bash
APP_DIR=/opt/myapp /opt/myapp/scripts/rollback-blue-green.sh
```

## 清理旧环境

确认新版本稳定后，再停止旧颜色环境。

```bash
current_color="$(cat /opt/myapp/state/current_color)"
if [ "$current_color" = "blue" ]; then
  old_color="green"
else
  old_color="blue"
fi

docker compose -f "/opt/myapp/compose/docker-compose.${old_color}.yml" down
```

镜像清理可以按实际磁盘情况执行：

```bash
docker image prune -f
```

不要在发版脚本里默认执行强清理，避免刚切流后无法快速回滚。

## 静态前端项目的蓝绿发布

如果项目不是后端服务，而是 Vite、Vue、React、VitePress 这类静态站点，也可以用目录蓝绿发布。

服务器目录：

```text
/opt/site
├── releases
│   ├── blue
│   └── green
├── state
│   └── current_color
└── current -> /opt/site/releases/blue
```

Nginx：

```nginx
server {
    listen 80;
    server_name example.com;

    root /opt/site/current;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

发版逻辑：

```bash
mkdir -p /opt/site/releases/blue /opt/site/releases/green /opt/site/state

current_color="$(cat /opt/site/state/current_color 2>/dev/null || echo blue)"
if [ "$current_color" = "blue" ]; then
  next_color="green"
else
  next_color="blue"
fi

rsync -av --delete ./dist/ "/opt/site/releases/${next_color}/"
ln -sfn "/opt/site/releases/${next_color}" /opt/site/current
echo "$next_color" > /opt/site/state/current_color
nginx -t
systemctl reload nginx
```

静态站点的蓝绿发布比容器更简单，本质是“先把新 dist 放到非当前目录，再原子切换软链接”。

## 数据库迁移注意事项

蓝绿发布能降低应用切换风险，但不能自动解决数据库兼容问题。

推荐规则：

1. 先做向后兼容迁移，比如只新增字段，不马上删除字段。
2. 旧版本和新版本都能兼容同一份 schema。
3. 新版本稳定后，再单独做清理迁移。
4. migration 不要由 blue 和 green 两个容器同时自动执行。

常见顺序：

```text
扩展 schema -> 发布新代码 -> 验证稳定 -> 清理旧字段
```

## 生产部署模式补充

实际生产环境里，如果服务器已经有宿主机 Nginx 管理多个站点，蓝绿发布通常会比上面的基础模板多做几件事：

1. 生产发版只允许从主干分支触发，`workflow_dispatch` 也要显式检查 `GITHUB_REF_NAME`。
2. GitHub runner 登录镜像仓库只负责构建和推送；服务器部署脚本里还要执行 `docker login --password-stdin`，再 `docker pull` 或 `docker compose pull`。
3. 宿主机 Nginx 已经占用 `80/443`，Web 容器只暴露本机蓝绿端口，例如上文模板里的 `18081/18082`。脚本读取当前 Nginx `proxy_pass` 指向的端口，再决定下一次启动 blue 还是 green。
4. Web 容器健康检查通过后，再更新宿主机 Nginx 的 `proxy_pass` 或 include 的 upstream 文件，并执行 `nginx -t && nginx -s reload`。
5. 切流后再通过公网域名访问 `/api/health` 做最终检查；如果公网检查失败，脚本要把 Nginx 恢复到旧端口。
6. 后台任务容器、定时任务容器、队列 worker 这类常驻进程不参与 Web 蓝绿切流，但要在同一次发版中更新并单独检查运行状态。
7. 复杂项目可以在新 Web 容器里执行部署自检，例如关键环境变量、数据库连接、外部依赖连通性检查，再允许切流。
8. 旧 Web 容器可以在切流成功后延迟停止，也可以保留一段观察期；具体取决于回滚速度和服务器资源。

这个模式比“生成 `upstream.conf` 后 reload Nginx”的模板更贴近已有宿主机 Nginx 管理多个域名的服务器。如果你的服务器只有一个项目，使用上面的 `upstream.conf` 模板更简单；如果服务器已经有多站点配置，优先考虑按域名定位并修改目标 server block 的 `proxy_pass` 端口。

## GitHub Environment 审批

如果生产发版需要人工确认，可以在 GitHub 创建 `production` Environment：

```text
Settings -> Environments -> New environment -> production
```

然后在 workflow 里写：

```yaml
environment:
  name: production
```

可以在 Environment 中配置 required reviewers，让生产部署在执行 deploy job 前先等待审批。

## 常见问题

### 1. 为什么要加 concurrency

避免两个生产发版同时执行。建议：

```yaml
concurrency:
  group: deploy-production
  cancel-in-progress: false
```

生产发版不建议自动取消正在执行的旧发版，避免停在半切流状态。

### 2. 为什么发版脚本里先健康检查再切 Nginx

这是蓝绿发布的关键。新容器先在非当前端口启动，健康检查通过后才切流量。健康检查失败时，Nginx 仍指向旧版本。

### 3. 为什么旧环境不马上 down

旧环境保留一段时间可以快速回滚。确认新版本稳定后，再手动或定时清理旧环境。

### 4. 为什么不直接用 latest 部署

`latest` 不适合做可追溯发版。建议每次发版使用 commit SHA、tag 或 release version。`latest` 可以保留给人工查看，但部署脚本应该使用不可变 tag。

### 5. SSH 私钥应该怎么放

私钥放到 GitHub Actions Secrets，不要提交到仓库。服务器上 `authorized_keys` 只加入发版公钥，并尽量给发版用户最小权限。

## 发版前检查清单

- [ ] GitHub Secrets 已配置完整。
- [ ] 服务器能用发版用户 SSH 登录。
- [ ] 发版用户有执行 `docker compose`、`nginx -t`、`systemctl reload nginx` 的权限。
- [ ] blue 和 green 使用不同容器名、不同宿主机端口。
- [ ] `/api/health` 或项目实际健康检查路径能真实反映应用可用状态。
- [ ] Nginx `upstream.conf` 已被主配置 include。
- [ ] 数据库迁移兼容旧版本和新版本。
- [ ] 旧环境不会在发版成功后立即删除。

## 参考

- [GitHub Actions workflow syntax](https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions)
- [GitHub Actions environments](https://docs.github.com/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [Using secrets in GitHub Actions](https://docs.github.com/actions/security-guides/using-secrets-in-github-actions)
- [Docker Build GitHub Actions](https://docs.docker.com/build/ci/github-actions/)
- [docker/build-push-action](https://github.com/docker/build-push-action)
- [docker/login-action](https://github.com/docker/login-action)
