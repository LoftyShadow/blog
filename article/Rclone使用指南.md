# Rclone 使用指南

> Rclone 是一个命令行程序，用于管理云存储上的文件。它是云供应商 Web 存储界面的功能丰富的替代品。

## 简介

Rclone 支持超过 40 种云存储产品，包括：
- 阿里云 OSS
- 腾讯云 COS
- AWS S3
- Google Drive
- OneDrive
- Dropbox
- 等等...

**主要特性**：
- 支持多种云存储协议
- 支持文件同步、复制、移动
- 支持加密传输
- 支持断点续传
- 支持挂载云存储为本地磁盘
- 跨平台支持（Windows/Linux/Mac）

## 安装

### Windows 安装

**方法一：使用 Scoop（推荐）**
```bash
scoop install rclone
```

**方法二：手动安装**
1. 访问 [Rclone 官网](https://rclone.org/downloads/)
2. 下载 Windows 版本
3. 解压到指定目录（如 `C:\Program Files\rclone`）
4. 将目录添加到系统环境变量 PATH

### Linux 安装

```bash
# Ubuntu/Debian
sudo apt install rclone

# CentOS/RHEL
sudo yum install rclone

# 或使用官方脚本
curl https://rclone.org/install.sh | sudo bash
```

### Mac 安装

```bash
# 使用 Homebrew
brew install rclone
```

### 验证安装

```bash
rclone version
```

## 配置 OSS

### 交互式配置

```bash
rclone config
```

配置流程示例（以阿里云 OSS 为例）：

```
n) New remote
s) Set configuration password
q) Quit config
n/s/q> n

name> aliyun-oss

Type of storage to configure.
Choose a number from below, or type in your own value
...
5 / Alibaba Cloud Object Storage System (OSS)
   \ "s3"
...
Storage> s3

Choose your S3 provider.
Choose a number from below, or type in your own value
...
4 / Alibaba Cloud Object Storage System (OSS)
   \ "Alibaba"
...
provider> Alibaba

Get AWS credentials from runtime (environment variables or EC2/ECS meta data if no env vars).
Only applies if access_key_id and secret_access_key is blank.
Choose a number from below, or type in your own value
 1 / Enter AWS credentials in the next step
   \ "false"
 2 / Get AWS credentials from the environment (env vars or IAM)
   \ "true"
env_auth> 1

AWS Access Key ID.
access_key_id> YOUR_ACCESS_KEY_ID

AWS Secret Access Key (password)
secret_access_key> YOUR_SECRET_ACCESS_KEY

Endpoint for OSS API.
endpoint> oss-cn-hangzhou.aliyuncs.com

Edit advanced config? (y/n)
y/n> n

Remote config
--------------------
[aliyun-oss]
type = s3
provider = Alibaba
access_key_id = YOUR_ACCESS_KEY_ID
secret_access_key = YOUR_SECRET_ACCESS_KEY
endpoint = oss-cn-hangzhou.aliyuncs.com
--------------------
y) Yes this is OK (default)
e) Edit this remote
d) Delete this remote
y/e/d> y
```

### 配置文件位置

- **Windows**: `%USERPROFILE%\.config\rclone\rclone.conf`
- **Linux/Mac**: `~/.config/rclone/rclone.conf`

### 手动编辑配置文件

```ini
[aliyun-oss]
type = s3
provider = Alibaba
access_key_id = YOUR_ACCESS_KEY_ID
secret_access_key = YOUR_SECRET_ACCESS_KEY
endpoint = oss-cn-hangzhou.aliyuncs.com
acl = private

[tencent-cos]
type = s3
provider = TencentCOS
access_key_id = YOUR_SECRET_ID
secret_access_key = YOUR_SECRET_KEY
endpoint = cos.ap-guangzhou.myqcloud.com
acl = private
```

## 常用命令

### 基础操作

#### 列出所有配置的远程存储

```bash
rclone listremotes
```

#### 列出存储桶（Bucket）

```bash
rclone lsd aliyun-oss:
```

#### 列出文件

```bash
# 列出指定 bucket 的所有文件
rclone ls aliyun-oss:bucket-name

# 列出指定目录的文件
rclone ls aliyun-oss:bucket-name/path/to/dir

# 列出文件（带详细信息）
rclone lsl aliyun-oss:bucket-name

# 只列出目录
rclone lsd aliyun-oss:bucket-name
```

### 文件操作

#### 上传文件

```bash
# 上传单个文件
rclone copy /local/path/file.txt aliyun-oss:bucket-name/path/

# 上传整个目录
rclone copy /local/path/dir aliyun-oss:bucket-name/path/

# 同步目录（会删除目标中多余的文件）
rclone sync /local/path/dir aliyun-oss:bucket-name/path/
```

#### 下载文件

```bash
# 下载单个文件
rclone copy aliyun-oss:bucket-name/path/file.txt /local/path/

# 下载整个目录
rclone copy aliyun-oss:bucket-name/path/dir /local/path/

# 同步下载
rclone sync aliyun-oss:bucket-name/path/dir /local/path/
```

#### 移动文件

```bash
# 移动文件
rclone move /local/path/file.txt aliyun-oss:bucket-name/path/

# 移动目录
rclone move /local/path/dir aliyun-oss:bucket-name/path/
```

#### 删除文件

```bash
# 删除单个文件
rclone delete aliyun-oss:bucket-name/path/file.txt

# 删除目录（包括所有文件）
rclone purge aliyun-oss:bucket-name/path/dir

# 删除空目录
rclone rmdir aliyun-oss:bucket-name/path/dir
```

### 高级操作

#### 查看文件大小

```bash
# 查看目录总大小
rclone size aliyun-oss:bucket-name/path/

# 查看每个文件的大小
rclone ls aliyun-oss:bucket-name/path/ --max-depth 1
```

#### 检查文件差异

```bash
# 检查本地和远程的差异
rclone check /local/path aliyun-oss:bucket-name/path/
```

#### 生成文件列表

```bash
# 生成文件列表到文件
rclone ls aliyun-oss:bucket-name > file-list.txt
```

#### 过滤文件

```bash
# 只上传 .jpg 文件
rclone copy /local/path aliyun-oss:bucket-name/path/ --include "*.jpg"

# 排除 .tmp 文件
rclone copy /local/path aliyun-oss:bucket-name/path/ --exclude "*.tmp"

# 排除目录
rclone copy /local/path aliyun-oss:bucket-name/path/ --exclude "node_modules/**"
```

## 实际使用示例

### 示例 1：备份本地文件到 OSS

```bash
# 备份整个目录到 OSS
rclone sync /home/user/documents aliyun-oss:backup-bucket/documents \
  --progress \
  --transfers 4 \
  --checkers 8

# 参数说明：
# --progress: 显示进度
# --transfers 4: 同时传输 4 个文件
# --checkers 8: 同时检查 8 个文件
```

### 示例 2：定时备份脚本

```bash
#!/bin/bash
# backup.sh

# 设置变量
SOURCE_DIR="/home/user/important-data"
REMOTE_PATH="aliyun-oss:backup-bucket/$(date +%Y-%m-%d)"
LOG_FILE="/var/log/rclone-backup.log"

# 执行备份
rclone sync "$SOURCE_DIR" "$REMOTE_PATH" \
  --log-file="$LOG_FILE" \
  --log-level INFO \
  --transfers 4 \
  --checkers 8

# 检查执行结果
if [ $? -eq 0 ]; then
    echo "$(date): Backup successful" >> "$LOG_FILE"
else
    echo "$(date): Backup failed" >> "$LOG_FILE"
fi
```

### 示例 3：从 OSS 下载文件

```bash
# 下载指定日期的备份
rclone copy aliyun-oss:backup-bucket/2024-01-01 /home/user/restore \
  --progress \
  --transfers 4
```

### 示例 4：在两个云存储之间同步

```bash
# 从阿里云 OSS 同步到腾讯云 COS
rclone sync aliyun-oss:source-bucket tencent-cos:target-bucket \
  --progress \
  --transfers 4
```

### 示例 5：挂载 OSS 为本地磁盘

```bash
# Linux/Mac
rclone mount aliyun-oss:bucket-name /mnt/oss \
  --daemon \
  --allow-other \
  --vfs-cache-mode full

# Windows
rclone mount aliyun-oss:bucket-name X: \
  --vfs-cache-mode full
```
**Windows需安装[WinFSP](https://winfsp.dev/rel/)**

## 常用参数说明

| 参数 | 说明 |
|------|------|
| `--progress` | 显示传输进度 |
| `--transfers N` | 同时传输 N 个文件（默认 4） |
| `--checkers N` | 同时检查 N 个文件（默认 8） |
| `--dry-run` | 模拟运行，不实际执行 |
| `--verbose` / `-v` | 显示详细信息 |
| `--log-file FILE` | 将日志写入文件 |
| `--log-level LEVEL` | 日志级别（DEBUG/INFO/NOTICE/ERROR） |
| `--include PATTERN` | 包含匹配的文件 |
| `--exclude PATTERN` | 排除匹配的文件 |
| `--max-size SIZE` | 只传输小于指定大小的文件 |
| `--min-size SIZE` | 只传输大于指定大小的文件 |
| `--bwlimit RATE` | 限制带宽（如 10M） |

## 性能优化建议

1. **调整并发数**：根据网络带宽和文件数量调整 `--transfers` 和 `--checkers`
   ```bash
   rclone copy source dest --transfers 8 --checkers 16
   ```

2. **使用缓存**：挂载时使用缓存模式
   ```bash
   rclone mount remote:path /mnt --vfs-cache-mode full
   ```

3. **限制带宽**：避免占用全部带宽
   ```bash
   rclone copy source dest --bwlimit 10M
   ```

4. **断点续传**：Rclone 默认支持断点续传，中断后重新执行命令即可继续

## 常见问题

### 1. 配置文件在哪里？

```bash
# 查看配置文件位置
rclone config file
```

### 2. 如何测试配置是否正确？

```bash
# 列出远程存储
rclone lsd remote-name:
```

### 3. 如何查看传输速度？

```bash
# 使用 --progress 参数
rclone copy source dest --progress
```

### 4. 如何排查错误？

```bash
# 使用 -vv 参数查看详细日志
rclone copy source dest -vv
```

### 5. 如何加密传输？

Rclone 默认使用 HTTPS 加密传输，无需额外配置。

## 参考资料

- [Rclone 官方文档](https://rclone.org/docs/)
- [Rclone GitHub](https://github.com/rclone/rclone)
- [阿里云 OSS 文档](https://help.aliyun.com/product/31815.html)
- [腾讯云 COS 文档](https://cloud.tencent.com/document/product/436)

## 总结

Rclone 是一个功能强大的云存储管理工具，适合：
- 备份重要数据到云存储
- 在不同云存储之间迁移数据
- 挂载云存储为本地磁盘
- 自动化云存储管理任务

掌握 Rclone 的基本命令和参数，可以大大提高云存储的使用效率。
