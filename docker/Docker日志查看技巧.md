# Docker 日志查看技巧

## 基础日志查看

### 查看容器日志
```bash
# 查看容器日志
docker logs <container_id/name>

# 实时查看日志（类似 tail -f）
docker logs -f <container_id/name>

# 查看最后 N 行日志
docker logs --tail 100 <container_id/name>

# 查看最近 N 分钟的日志
docker logs --since 5m <container_id/name>
```

## 高级日志查看技巧

### 1. 时间范围过滤

```bash
# 查看指定时间之后的日志
docker logs --since "2024-01-01T10:00:00" <container_id>

# 查看指定时间之前的日志
docker logs --until "2024-01-01T12:00:00" <container_id>

# 查看时间范围内的日志
docker logs --since "2024-01-01T10:00:00" --until "2024-01-01T12:00:00" <container_id>

# 相对时间（支持 s/m/h）
docker logs --since 30m <container_id>  # 最近 30 分钟
docker logs --since 2h <container_id>   # 最近 2 小时
docker logs --since 1d <container_id>   # 最近 1 天
```

### 2. 结合 grep 过滤关键字

```bash
# 过滤包含 ERROR 的日志
docker logs <container_id> 2>&1 | grep ERROR

# 过滤多个关键字（OR）
docker logs <container_id> 2>&1 | grep -E "ERROR|WARN"

# 过滤并高亮显示
docker logs <container_id> 2>&1 | grep --color=auto ERROR

# 实时过滤
docker logs -f <container_id> 2>&1 | grep ERROR

# 排除某些关键字
docker logs <container_id> 2>&1 | grep -v "DEBUG"
```

### 3. 显示时间戳

```bash
# 显示时间戳
docker logs -t <container_id>

# 结合时间戳和实时查看
docker logs -tf <container_id>

# 显示时间戳并过滤
docker logs -t <container_id> 2>&1 | grep ERROR
```

### 4. 限制日志输出

```bash
# 只看最后 50 行（--tail 和 -n 等效）
docker logs --tail 50 <container_id>
docker logs -n 50 <container_id>

# 实时查看最后 50 行
docker logs -f --tail 50 <container_id>
docker logs -f -n 50 <container_id>

# 查看最近 10 分钟的最后 100 行
docker logs --since 10m --tail 100 <container_id>
docker logs --since 10m -n 100 <container_id>
```

**说明**：`-n` 是 `--tail` 的短格式，两者完全等效，可根据个人习惯选择使用。

## 日志格式化与分析

### 1. 使用 jq 解析 JSON 日志

```bash
# 解析 JSON 格式日志
docker logs <container_id> 2>&1 | jq '.'

# 提取特定字段
docker logs <container_id> 2>&1 | jq '.level, .message'

# 过滤特定级别的日志
docker logs <container_id> 2>&1 | jq 'select(.level == "error")'
```

### 2. 使用 awk 格式化输出

```bash
# 只显示时间和消息
docker logs -t <container_id> 2>&1 | awk '{print $1, $2, $NF}'

# 统计错误数量
docker logs <container_id> 2>&1 | grep ERROR | wc -l

# 统计每种日志级别的数量
docker logs <container_id> 2>&1 | awk '{print $3}' | sort | uniq -c
```

### 3. 保存日志到文件

```bash
# 保存日志到文件
docker logs <container_id> > container.log 2>&1

# 保存最近的日志
docker logs --since 1h <container_id> > last_hour.log 2>&1

# 保存并实时查看
docker logs -f <container_id> 2>&1 | tee container.log
```

## 多容器日志查看

### 1. 使用 docker-compose

```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs <service_name>

# 实时查看所有服务日志
docker-compose logs -f

# 查看最后 100 行
docker-compose logs --tail 100

# 查看多个服务日志
docker-compose logs -f service1 service2
```

### 2. 批量查看容器日志

```bash
# 查看所有运行中容器的日志
for container in $(docker ps -q); do
    echo "=== Logs for $container ==="
    docker logs --tail 20 $container
done

# 查看特定前缀的容器日志
for container in $(docker ps --filter "name=app" -q); do
    docker logs --tail 50 $container
done
```

## 日志驱动配置

### 1. 查看日志驱动

```bash
# 查看容器的日志驱动
docker inspect <container_id> | grep LogConfig -A 10

# 查看 Docker 默认日志驱动
docker info | grep "Logging Driver"
```

### 2. 配置日志驱动（docker-compose.yml）

```yaml
version: '3'
services:
  app:
    image: myapp
    logging:
      driver: "json-file"
      options:
        max-size: "10m"      # 单个日志文件最大 10MB
        max-file: "3"        # 最多保留 3 个日志文件
        compress: "true"     # 压缩旧日志
```

### 3. 运行时指定日志驱动

```bash
# 使用 json-file 驱动并限制大小
docker run -d \
  --log-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  myapp

# 使用 syslog 驱动
docker run -d \
  --log-driver syslog \
  --log-opt syslog-address=tcp://192.168.1.100:514 \
  myapp
```

## 实用技巧

### 1. 快速定位错误

```bash
# 查找最近的错误
docker logs --since 1h <container_id> 2>&1 | grep -i error | tail -20

# 查找异常堆栈
docker logs <container_id> 2>&1 | grep -A 10 "Exception"

# 查找启动失败原因
docker logs <container_id> 2>&1 | grep -i "failed\|error" | head -20
```

### 2. 监控日志变化

```bash
# 实时监控并高亮错误
docker logs -f <container_id> 2>&1 | grep --color=auto -E "ERROR|WARN|$"

# 监控并发送通知（示例）
docker logs -f <container_id> 2>&1 | while read line; do
    if echo "$line" | grep -q "ERROR"; then
        echo "发现错误: $line"
        # 可以在这里添加告警逻辑
    fi
done
```

### 3. 日志分析脚本

```bash
#!/bin/bash
# log_analysis.sh - Docker 日志分析脚本

CONTAINER=$1
SINCE=${2:-1h}

echo "=== 日志统计 ==="
echo "总行数: $(docker logs --since $SINCE $CONTAINER 2>&1 | wc -l)"
echo "ERROR 数量: $(docker logs --since $SINCE $CONTAINER 2>&1 | grep -c ERROR)"
echo "WARN 数量: $(docker logs --since $SINCE $CONTAINER 2>&1 | grep -c WARN)"
echo ""

echo "=== 最近的错误 ==="
docker logs --since $SINCE $CONTAINER 2>&1 | grep ERROR | tail -10
```

## 日志清理

### 1. 清理容器日志

```bash
# 清空容器日志（需要容器 ID）
truncate -s 0 $(docker inspect --format='{{.LogPath}}' <container_id>)

# 批量清空所有容器日志
for container in $(docker ps -q); do
    logpath=$(docker inspect --format='{{.LogPath}}' $container)
    truncate -s 0 $logpath
done
```

### 2. 自动清理脚本

```bash
#!/bin/bash
# clean_docker_logs.sh - 清理 Docker 日志

# 清理超过 100MB 的日志文件
for log in $(find /var/lib/docker/containers/ -name "*-json.log" -size +100M); do
    echo "清理日志: $log"
    truncate -s 0 $log
done
```

## 常见问题

### 1. 日志过大导致磁盘满

**解决方案**：
```bash
# 1. 配置日志轮转
# 在 /etc/docker/daemon.json 中添加：
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}

# 2. 重启 Docker
sudo systemctl restart docker
```

### 2. 日志不显示时间戳

**解决方案**：
```bash
# 使用 -t 参数显示时间戳
docker logs -t <container_id>
```

### 3. 日志输出乱码

**解决方案**：
```bash
# 设置正确的字符编码
docker logs <container_id> 2>&1 | iconv -f UTF-8 -t UTF-8//IGNORE
```

## 推荐工具

### 1. lazydocker
```bash
# 安装 lazydocker（交互式 Docker 管理工具）
curl https://raw.githubusercontent.com/jesseduffield/lazydocker/master/scripts/install_update_linux.sh | bash

# 使用
lazydocker
```

### 2. dockly
```bash
# 安装 dockly（终端 Docker 管理工具）
npm install -g dockly

# 使用
dockly
```

### 3. ctop
```bash
# 安装 ctop（容器监控工具）
sudo wget https://github.com/bcicen/ctop/releases/download/v0.7.7/ctop-0.7.7-linux-amd64 -O /usr/local/bin/ctop
sudo chmod +x /usr/local/bin/ctop

# 使用
ctop
```

## 最佳实践

1. **配置日志轮转**：防止日志文件无限增长
2. **使用结构化日志**：便于解析和分析（如 JSON 格式）
3. **合理设置日志级别**：生产环境避免 DEBUG 级别
4. **定期清理日志**：避免磁盘空间不足
5. **使用日志聚合工具**：如 ELK、Loki 等集中管理日志
6. **添加时间戳**：便于追踪问题发生时间
7. **保存关键日志**：重要操作前后保存日志快照

## 参考资料

- [Docker 官方文档 - 日志驱动](https://docs.docker.com/config/containers/logging/)
- [Docker Compose 日志配置](https://docs.docker.com/compose/compose-file/compose-file-v3/#logging)