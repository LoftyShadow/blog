# Docker Compose 配置项详解

Docker Compose 使用 YAML 文件来定义和管理多容器应用。本文详细介绍各个配置项的作用及其对容器运行的影响。

## 一、基础结构

```yaml
version: '3.8'  # Compose 文件版本

services:       # 服务定义
  service1:
    # 服务配置
  service2:
    # 服务配置

networks:       # 网络定义
  network1:
    # 网络配置

volumes:        # 数据卷定义
  volume1:
    # 数据卷配置
```

## 二、服务配置（services）

### 2.1 镜像配置

#### image - 指定镜像

```yaml
services:
  web:
    image: nginx:1.21
```

**影响**：
- 直接使用现有镜像，无需构建
- 适合使用官方镜像或已构建好的镜像
- 镜像不存在时会自动从 Docker Hub 拉取

#### build - 构建镜像

```yaml
services:
  web:
    build:
      context: ./app          # 构建上下文路径
      dockerfile: Dockerfile  # Dockerfile 文件名
      args:                   # 构建参数
        - NODE_ENV=production
```

**影响**：
- 从 Dockerfile 构建自定义镜像
- `context` 指定构建上下文，影响 COPY/ADD 指令的相对路径
- `args` 传递构建时变量，可在 Dockerfile 中使用 ARG 接收
- 每次 `docker-compose up --build` 会重新构建

### 2.2 端口映射（ports）

```yaml
services:
  web:
    ports:
      - "8080:80"        # 主机端口:容器端口
      - "443:443"
      - "127.0.0.1:3000:3000"  # 绑定到特定 IP
```

**影响**：
- 将容器端口映射到主机端口
- 格式：`主机端口:容器端口` 或 `主机IP:主机端口:容器端口`
- 主机端口被占用会导致启动失败
- 不指定主机端口会随机分配（如 `- "80"`）

**注意事项**：
- 避免端口冲突
- 生产环境建议绑定到 `127.0.0.1` 避免外部直接访问
- 使用 `expose` 仅在容器间通信，不映射到主机

### 2.3 数据卷挂载（volumes）

#### 命名卷（Named Volume）

```yaml
services:
  db:
    volumes:
      - db_data:/var/lib/mysql  # 命名卷:容器路径

volumes:
  db_data:  # 声明命名卷
```

**影响**：
- 数据持久化，容器删除后数据不丢失
- 由 Docker 管理，存储在 `/var/lib/docker/volumes/`
- 适合数据库、配置文件等需要持久化的数据

#### 绑定挂载（Bind Mount）

```yaml
services:
  web:
    volumes:
      - ./app:/usr/share/nginx/html  # 主机路径:容器路径
      - ./nginx.conf:/etc/nginx/nginx.conf:ro  # :ro 只读
```

**影响**：
- 直接挂载主机目录到容器
- 主机文件修改立即反映到容器（适合开发环境）
- `:ro` 设置只读，防止容器修改主机文件
- 路径必须是绝对路径或相对于 `docker-compose.yml` 的相对路径

#### 匿名卷（Anonymous Volume）

```yaml
services:
  app:
    volumes:
      - /app/node_modules  # 仅指定容器路径
```

**影响**：
- 临时数据卷，容器删除后可能被清理
- 常用于排除某些目录不被绑定挂载覆盖
- 例如：挂载 `./app:/app` 但保留容器内的 `node_modules`

### 2.4 环境变量（environment）

#### 方式一：键值对

```yaml
services:
  app:
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
      - DB_PORT=3306
```

#### 方式二：对象格式

```yaml
services:
  app:
    environment:
      NODE_ENV: production
      DB_HOST: mysql
      DB_PORT: 3306
```

#### 方式三：从文件加载

```yaml
services:
  app:
    env_file:
      - .env
      - .env.production
```

**影响**：
- 传递配置到容器内部
- 应用可通过 `process.env.NODE_ENV` 等方式读取
- `env_file` 适合管理大量环境变量
- 敏感信息（密码、密钥）建议使用 Docker Secrets

**优先级**：
1. `docker-compose.yml` 中的 `environment`（最高）
2. `env_file` 指定的文件
3. Dockerfile 中的 `ENV`
4. 主机环境变量（最低）

### 2.5 容器名称（container_name）

```yaml
services:
  web:
    container_name: my-nginx
```

**影响**：
- 指定容器名称，默认为 `项目名_服务名_序号`
- 便于识别和管理
- **注意**：指定后无法使用 `docker-compose up --scale` 扩展多个实例

### 2.6 重启策略（restart）

```yaml
services:
  app:
    restart: always
```

**可选值**：
- `no`：默认，不自动重启
- `always`：总是重启（容器停止或 Docker 重启时）
- `on-failure`：仅在容器非正常退出时重启
- `unless-stopped`：总是重启，除非手动停止

**影响**：
- 控制容器异常退出后的行为
- 生产环境建议使用 `always` 或 `unless-stopped`
- 开发环境可使用 `no` 避免频繁重启

### 2.7 依赖关系（depends_on）

```yaml
services:
  web:
    depends_on:
      - db
      - redis
  db:
    image: mysql:8.0
  redis:
    image: redis:7
```

**影响**：
- 控制服务启动顺序，`web` 会在 `db` 和 `redis` 之后启动
- **注意**：仅控制启动顺序，不等待依赖服务完全就绪
- 依赖服务停止时，当前服务也会停止

#### 高级用法：等待服务就绪

```yaml
services:
  web:
    depends_on:
      db:
        condition: service_healthy  # 等待健康检查通过
  db:
    image: mysql:8.0
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
```

**可选条件**：
- `service_started`：默认，服务启动即可
- `service_healthy`：等待健康检查通过
- `service_completed_successfully`：等待服务成功退出

### 2.8 网络配置（networks）

```yaml
services:
  web:
    networks:
      - frontend
      - backend
  db:
    networks:
      - backend

networks:
  frontend:
  backend:
```

**影响**：
- 控制服务间的网络隔离
- 同一网络内的服务可以通过服务名互相访问
- 不同网络的服务无法直接通信
- 未指定时，所有服务在默认网络中

**服务间通信示例**：
```yaml
# web 可以通过 http://db:3306 访问数据库
services:
  web:
    networks:
      - app_net
  db:
    networks:
      - app_net

networks:
  app_net:
```

### 2.9 命令配置（command & entrypoint）

#### command - 覆盖默认命令

```yaml
services:
  app:
    image: node:18
    command: npm start
    # 或数组格式
    command: ["npm", "start"]
```

**影响**：
- 覆盖 Dockerfile 中的 `CMD` 指令
- 适合在不同环境使用不同启动命令
- 数组格式避免 shell 解析问题

#### entrypoint - 覆盖入口点

```yaml
services:
  app:
    image: node:18
    entrypoint: /bin/sh
    command: -c "npm install && npm start"
```

**影响**：
- 覆盖 Dockerfile 中的 `ENTRYPOINT` 指令
- `entrypoint` 是主进程，`command` 是参数
- 组合使用：`entrypoint` + `command`

### 2.10 健康检查（healthcheck）

```yaml
services:
  web:
    image: nginx
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]
      interval: 30s      # 检查间隔
      timeout: 10s       # 超时时间
      retries: 3         # 重试次数
      start_period: 40s  # 启动等待时间
```

**影响**：
- 监控容器健康状态
- 健康检查失败会标记为 `unhealthy`
- 配合 `depends_on` 的 `service_healthy` 使用
- 编排工具（如 Swarm）可自动重启不健康的容器

**测试命令格式**：
- `["CMD", "executable", "arg1"]`：直接执行
- `["CMD-SHELL", "command"]`：通过 shell 执行

**禁用健康检查**：
```yaml
healthcheck:
  disable: true
```

### 2.11 资源限制

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '0.5'      # 最多使用 0.5 核 CPU
          memory: 512M     # 最多使用 512MB 内存
        reservations:
          cpus: '0.25'     # 预留 0.25 核 CPU
          memory: 256M     # 预留 256MB 内存
```

**影响**：
- 限制容器资源使用，防止单个容器占用过多资源
- `limits`：硬限制，超过会被限流或 OOM
- `reservations`：软限制，保证最低资源
- **注意**：需要 Docker Swarm 模式或 Compose V3+ 支持

## 三、网络配置（networks）

### 3.1 默认网络

```yaml
services:
  web:
    image: nginx
  db:
    image: mysql
```

**影响**：
- 未指定网络时，Compose 自动创建默认网络
- 网络名称：`项目名_default`
- 所有服务都在同一网络中，可通过服务名互相访问

### 3.2 自定义网络

#### bridge 网络（默认）

```yaml
networks:
  app_net:
    driver: bridge
    ipam:
      config:
        - subnet: 172.28.0.0/16
          gateway: 172.28.0.1
```

**影响**：
- 桥接网络，容器间可通信
- 可自定义子网和网关
- 适合单主机部署

#### host 网络

```yaml
services:
  app:
    network_mode: host
```

**影响**：
- 容器直接使用主机网络
- 无需端口映射，性能最佳
- 端口冲突风险高，不推荐生产环境

#### overlay 网络

```yaml
networks:
  app_net:
    driver: overlay
    attachable: true
```

**影响**：
- 跨主机通信，用于 Docker Swarm
- 需要 Swarm 模式或外部 overlay 网络
- 适合多主机集群部署

### 3.3 外部网络

```yaml
networks:
  existing_net:
    external: true
    name: my_existing_network
```

**影响**：
- 使用已存在的网络，不由 Compose 管理
- `docker-compose down` 不会删除该网络
- 适合多个项目共享网络

## 四、数据卷配置（volumes）

### 4.1 命名卷

```yaml
services:
  db:
    volumes:
      - db_data:/var/lib/mysql

volumes:
  db_data:
    driver: local
```

**影响**：
- 由 Docker 管理的持久化存储
- 数据存储在 `/var/lib/docker/volumes/`
- 容器删除后数据保留
- 适合数据库、配置文件等

### 4.2 外部卷

```yaml
volumes:
  db_data:
    external: true
    name: my_existing_volume
```

**影响**：
- 使用已存在的数据卷
- `docker-compose down` 不会删除该卷
- 适合多个项目共享数据

### 4.3 驱动选项

```yaml
volumes:
  db_data:
    driver: local
    driver_opts:
      type: nfs
      o: addr=192.168.1.100,rw
      device: ":/path/to/dir"
```

**影响**：
- 支持 NFS、CIFS 等远程存储
- 适合集群环境共享数据
- 需要主机支持相应的文件系统

## 五、完整示例

### 5.1 Web 应用 + 数据库 + Redis

```yaml
version: '3.8'

services:
  # Web 应用
  web:
    build:
      context: ./app
      dockerfile: Dockerfile
    container_name: my-web-app
    ports:
      - "8080:80"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - REDIS_HOST=redis
    volumes:
      - ./app:/usr/src/app
      - /usr/src/app/node_modules
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - frontend
      - backend
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # MySQL 数据库
  db:
    image: mysql:8.0
    container_name: my-mysql
    environment:
      MYSQL_ROOT_PASSWORD: root123
      MYSQL_DATABASE: myapp
      MYSQL_USER: appuser
      MYSQL_PASSWORD: apppass
    volumes:
      - db_data:/var/lib/mysql
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    networks:
      - backend
    restart: always
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis 缓存
  redis:
    image: redis:7-alpine
    container_name: my-redis
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - backend
    restart: always

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge

volumes:
  db_data:
  redis_data:
```

## 六、最佳实践

### 6.1 环境变量管理

**推荐做法**：
```yaml
# docker-compose.yml
services:
  app:
    env_file:
      - .env
      - .env.production

# .env 文件
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
```

**注意事项**：
- 敏感信息不要提交到版本控制
- 使用 `.env.example` 作为模板
- 生产环境使用 Docker Secrets

### 6.2 数据持久化

**推荐做法**：
```yaml
services:
  db:
    volumes:
      - db_data:/var/lib/mysql  # 使用命名卷
      - ./backup:/backup:ro     # 备份目录只读

volumes:
  db_data:
    driver: local
```

**注意事项**：
- 数据库、配置文件使用命名卷
- 开发环境可使用绑定挂载
- 定期备份重要数据

### 6.3 网络隔离

**推荐做法**：
```yaml
services:
  web:
    networks:
      - frontend  # 对外服务
  app:
    networks:
      - frontend
      - backend   # 内部通信
  db:
    networks:
      - backend   # 仅内部访问

networks:
  frontend:
  backend:
```

**注意事项**：
- 数据库不应暴露在前端网络
- 使用多个网络实现服务隔离
- 生产环境避免使用 `host` 网络模式

### 6.4 健康检查

**推荐做法**：
```yaml
services:
  web:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    depends_on:
      db:
        condition: service_healthy
```

**注意事项**：
- 所有服务都应配置健康检查
- `start_period` 给予足够的启动时间
- 配合 `depends_on` 确保依赖服务就绪

### 6.5 资源限制

**推荐做法**：
```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

**注意事项**：
- 生产环境必须设置资源限制
- 根据实际负载调整限制值
- 避免单个容器占用过多资源

### 6.6 日志管理

**推荐做法**：
```yaml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

**注意事项**：
- 限制日志文件大小，避免磁盘占满
- 使用日志收集工具（如 ELK）
- 生产环境考虑使用 `syslog` 或 `fluentd` 驱动

## 七、常用命令

```bash
# 启动服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f [service_name]

# 停止服务
docker-compose stop

# 停止并删除容器、网络
docker-compose down

# 停止并删除容器、网络、数据卷
docker-compose down -v

# 重新构建镜像
docker-compose build

# 重新构建并启动
docker-compose up -d --build

# 扩展服务实例
docker-compose up -d --scale web=3

# 验证配置文件
docker-compose config
```

## 八、常见问题

### 8.1 端口冲突

**问题**：`Error: port is already allocated`

**解决**：
- 修改主机端口映射
- 停止占用端口的服务
- 使用 `docker-compose ps` 检查已运行的容器

### 8.2 数据卷权限问题

**问题**：容器内无法写入挂载的目录

**解决**：
```yaml
services:
  app:
    user: "1000:1000"  # 指定用户 ID
    volumes:
      - ./data:/data
```

### 8.3 服务启动顺序

**问题**：应用启动时数据库未就绪

**解决**：
```yaml
services:
  app:
    depends_on:
      db:
        condition: service_healthy  # 等待健康检查
```

### 8.4 网络连接问题

**问题**：容器间无法通信

**解决**：
- 确保服务在同一网络中
- 使用服务名而非 IP 地址
- 检查防火墙规则

## 九、总结

Docker Compose 配置项的影响：

| 配置项 | 主要影响 | 适用场景 |
|--------|----------|----------|
| `image/build` | 镜像来源 | 所有服务 |
| `ports` | 端口映射 | 对外服务 |
| `volumes` | 数据持久化 | 数据库、配置 |
| `environment` | 环境配置 | 所有服务 |
| `networks` | 网络隔离 | 安全隔离 |
| `depends_on` | 启动顺序 | 服务依赖 |
| `restart` | 重启策略 | 生产环境 |
| `healthcheck` | 健康监控 | 关键服务 |
| `deploy.resources` | 资源限制 | 生产环境 |

**关键要点**：
1. 合理使用网络隔离保证安全
2. 数据持久化使用命名卷
3. 配置健康检查确保服务可用
4. 设置资源限制防止资源耗尽
5. 敏感信息使用环境变量或 Secrets
6. 生产环境必须设置重启策略
