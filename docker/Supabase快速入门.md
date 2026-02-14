# Supabase Docker 自托管快速入门

Supabase 是一个开源的 Firebase 替代方案，提供 PostgreSQL 数据库、认证、实时订阅、存储、Edge Functions 等功能。

## 系统要求

| 资源 | 最低要求 | 推荐配置 |
|------|---------|---------|
| 内存 | 4 GB | 8 GB+ |
| CPU | 2 核 | 4 核+ |
| 磁盘 | 50 GB SSD | 80 GB+ SSD |

## 安装步骤

```shell:no-line-numbers
# 克隆仓库
git clone --depth 1 https://github.com/supabase/supabase

# 创建项目目录并复制配置
mkdir supabase-project
cp -rf supabase/docker/* supabase-project
cp supabase/docker/.env.example supabase-project/.env

# 进入项目目录
cd supabase-project
```

## 配置环境变量

编辑 `.env` 文件，修改以下关键配置：

```shell:no-line-numbers
# 数据库密码（仅使用字母和数字，避免 URL 编码问题）
POSTGRES_PASSWORD=your_secure_password

# JWT 密钥（用于 API 认证签名）
JWT_SECRET=your_jwt_secret

# API Key（客户端使用，权限受限）
ANON_KEY=your_anon_key

# Service Key（服务端使用，拥有完整权限，不要暴露到客户端）
SERVICE_ROLE_KEY=your_service_role_key

# Dashboard 登录凭证
DASHBOARD_USERNAME=supabase
DASHBOARD_PASSWORD=your_dashboard_password
```

也可以使用官方脚本一键生成所有密钥：

```shell:no-line-numbers
sh ./utils/generate-keys.sh
```

## 启动服务

```shell:no-line-numbers
# 拉取镜像
docker compose pull

# 后台启动
docker compose up -d

# 查看服务状态（所有服务应显示 healthy）
docker compose ps
```

## 访问地址

| 服务 | 地址 | 说明 |
|------|------|------|
| Studio Dashboard | `http://localhost:8000` | 可视化管理面板，需要 HTTP Basic Auth 登录 |
| REST API | `http://localhost:8000/rest/v1/` | PostgREST 接口 |
| Auth API | `http://localhost:8000/auth/v1/` | 认证服务 |
| Storage API | `http://localhost:8000/storage/v1/` | 文件存储 |
| Realtime | `http://localhost:8000/realtime/v1/` | 实时订阅 |
| Edge Functions | `http://localhost:8000/functions/v1/` | 边缘函数 |

## 常用管理命令

```shell:no-line-numbers
# 停止服务
docker compose down

# 查看日志
docker compose logs -f

# 查看指定服务日志
docker compose logs -f supabase-db

# 重启服务
docker compose down && docker compose up -d
```

## 版本更新

```shell:no-line-numbers
# 修改 docker-compose.yml 中的镜像版本号
# 然后执行：
docker compose pull
docker compose down && docker compose up -d
```

## 修改数据库密码

```shell:no-line-numbers
sh ./utils/db-passwd.sh
docker compose up -d --force-recreate
```

## 完全卸载

::: danger
以下操作会销毁所有数据，不可恢复。
:::

```shell:no-line-numbers
docker compose down -v
rm -rf volumes/db/data volumes/storage
```

## 注意事项

- `.env` 文件包含敏感信息，不要提交到版本控制
- `SERVICE_ROLE_KEY` 拥有完整数据库权限，绝不能暴露到客户端
- 密码尽量只用字母和数字，避免特殊字符导致 URL 编码问题
- 如果不需要某些服务（如 Realtime、Storage、Edge Functions），可以从 `docker-compose.yml` 中移除以减少资源占用

## 各模块功能说明

Supabase 自托管包含多个服务，每个服务对应一个独立的容器。

### 核心服务

| 服务 | 容器名 | 功能 |
|------|--------|------|
| PostgreSQL | `supabase-db` | 核心数据库，所有数据存储在这里 |
| PostgREST | `supabase-rest` | 自动将数据库表暴露为 RESTful API，无需手写后端 |
| GoTrue | `supabase-auth` | 认证服务，支持邮箱/密码、OAuth、手机号登录 |
| Studio | `supabase-studio` | Web 管理面板，可视化管理数据库、用户、存储等 |
| Kong | `supabase-kong` | API 网关，统一入口，处理路由和认证 |

### 可选服务

| 服务 | 容器名 | 功能 |
|------|--------|------|
| Realtime | `supabase-realtime` | 实时数据订阅，监听数据库变更推送到客户端（WebSocket） |
| Storage | `supabase-storage` | 文件存储服务，上传/下载文件，支持权限控制 |
| imgproxy | `supabase-imgproxy` | 图片处理，自动裁剪、缩放、格式转换 |
| Edge Functions | `supabase-edge-functions` | 运行 Deno 编写的 Serverless 函数 |
| Logflare | `supabase-analytics` | 日志收集和分析 |
| pg_meta | `supabase-meta` | 数据库元数据管理，Studio 通过它操作表结构 |
| Supavisor | `supabase-pooler` | 连接池，支持 Session 和 Transaction 模式 |

### 模块关系

```
客户端请求 → Kong（API 网关，端口 8000）
                ├── /rest/v1/     → PostgREST → PostgreSQL
                ├── /auth/v1/     → GoTrue → PostgreSQL
                ├── /storage/v1/  → Storage → PostgreSQL + MinIO
                ├── /realtime/v1/ → Realtime → PostgreSQL
                └── /functions/v1/→ Edge Functions（Deno）

Studio（管理面板）→ pg_meta → PostgreSQL
```

## 连接 Supabase MCP

MCP（Model Context Protocol）可以让 AI 助手（Claude、Cursor 等）直接操作 Supabase 项目。

### 云端 Supabase 配置

在 `~/.claude.json` 中添加：

```json
{
  "mcpServers": {
    "supabase": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "supabase-mcp-server@latest",
        "--read-only",
        "--project-ref=your_project_ref"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "your_personal_access_token"
      }
    }
  }
}
```

`--read-only` 建议默认开启，防止 AI 误操作。`--project-ref` 限定只能访问指定项目。

### 自托管 Supabase 开启 MCP

自托管的 MCP 端点内置在 Studio 中，通过 Kong 网关路由。默认是关闭的，需要手动开启。

**第一步：获取 Docker 网桥 IP**

```shell:no-line-numbers
docker inspect supabase-kong --format '{{range .NetworkSettings.Networks}}{{println .Gateway}}{{end}}'
# 通常输出类似 172.18.0.1
```

**第二步：修改 Kong 配置**

编辑 `./volumes/api/kong.yml`，找到 MCP 相关的路由部分：

1. 注释掉 `request-termination` 插件（默认返回 403 拒绝所有 MCP 请求）
2. 取消注释 `ip-restriction` 插件，将上一步获取的网桥 IP 加入 `allow` 列表

```yaml
# 修改前（默认拒绝所有请求）：
plugins:
  - name: request-termination
    config:
      status_code: 403
      message: "MCP access is disabled"

# 修改后（允许本机 Docker 网络访问）：
plugins:
  # - name: request-termination    # 注释掉这个
  #   config:
  #     status_code: 403
  #     message: "MCP access is disabled"
  - name: ip-restriction           # 取消注释这个
    config:
      allow:
        - 172.18.0.1               # 替换为你的网桥 IP
```

::: danger Kong 配置文件特殊字符注意
Kong 的 entrypoint 会用 `bash eval` 处理 `kong.yml` 来替换环境变量，这会导致 YAML 中的特殊字符被 bash 解释。修改 `kong.yml` 时注意：

1. `_format_version` 的双引号会被 eval 吞掉，必须转义：
   ```yaml
   # 错误：eval 后变成 _format_version: 2.1（数字），Kong 报错
   _format_version: "2.1"

   # 正确：转义后 eval 保留引号
   _format_version: \"2.1\"
   ```

2. `_comment` 字段必须用单引号，双引号中的冒号、括号等会被 bash 解释：
   ```yaml
   # 错误：冒号和括号会导致 bash 语法错误
   _comment: "PostgREST: /rest/v1/* -> http://rest:3000/*"

   # 正确：单引号内容不会被 bash 解释
   _comment: 'PostgREST: /rest/v1/* -> http://rest:3000/*'
   ```
:::

**第三步：重启 Kong**

```shell:no-line-numbers
docker compose restart kong
```

**第四步：配置 MCP 客户端**

MCP 端点地址为 `http://localhost:8000/mcp`，在 Claude Code 的 `~/.claude.json` 中配置：

```json
{
  "mcpServers": {
    "supabase": {
      "type": "streamable-http",
      "url": "http://localhost:8000/mcp"
    }
  }
}
```

::: warning
自托管 MCP 没有 OAuth 认证，绝不能暴露到公网。只能通过以下方式访问：
- 本机直接访问
- VPN 连接到服务器
- SSH 隧道：`ssh -L localhost:8080:localhost:8000 user@your-server`
:::

::: tip
如果 Supabase 跑在本机 Docker，不需要 SSH 隧道，直接用 `http://localhost:8000/mcp` 即可。

SSH 隧道只在 Supabase 部署在远程服务器时才需要：

```shell:no-line-numbers
# 将远程服务器的 8000 端口映射到本机 8080
ssh -L localhost:8080:localhost:8000 user@your-server

# 然后 MCP 端点变为 http://localhost:8080/mcp
```
:::

### MCP 能做什么

通过 MCP 连接后，AI 助手可以直接操作 Supabase：

| 类别 | 能力 |
|------|------|
| 数据库 | 执行 SQL 查询、创建/修改表结构、管理索引 |
| 认证 | 查看用户列表、管理用户状态 |
| 存储 | 管理 Bucket、查看文件列表 |
| 配置 | 获取项目配置（API Key、URL 等） |
| RLS | 查看和管理行级安全策略 |
| Edge Functions | 查看已部署的函数列表 |
