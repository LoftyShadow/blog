# SSHFS使用指南

## 简介

SSHFS (SSH Filesystem) 是一个基于 FUSE 的文件系统客户端，用于通过 SSH 协议挂载远程文件系统。它允许你像访问本地文件系统一样访问远程服务器上的文件。

## 安装

### Linux

#### Debian/Ubuntu
```bash
sudo apt update
sudo apt install sshfs
```

#### Fedora/RHEL
```bash
sudo dnf install sshfs
```

#### Arch Linux
```bash
sudo pacman -S sshfs
```

### macOS

使用 Homebrew 安装：
```bash
brew install macfuse
brew install gromgit/fuse/sshfs-mac
```

### Windows

Windows 用户可以使用 WinFsp 和 SSHFS-Win：
1. 下载并安装 [WinFsp](https://winfsp.dev/)
2. 下载并安装 [SSHFS-Win](https://github.com/winfsp/sshfs-win)

## 基本使用

### 挂载远程目录

基本语法：
```bash
sshfs [user@]host:[remote_directory] mountpoint [options]
```

示例：
```bash
# 挂载远程用户主目录
sshfs user@example.com:/home/user /mnt/remote

# 挂载指定远程目录
sshfs user@example.com:/var/www /mnt/www
```

### 卸载远程目录

Linux/macOS：
```bash
fusermount -u /mnt/remote
# 或
umount /mnt/remote
```

macOS 特定：
```bash
diskutil unmount /mnt/remote
```

## 常用选项

### 指定端口
```bash
sshfs -p 2222 user@example.com:/home/user /mnt/remote
```

### 使用 SSH 密钥
```bash
sshfs -o IdentityFile=~/.ssh/id_rsa user@example.com:/home/user /mnt/remote
```

### 允许其他用户访问
```bash
sshfs -o allow_other user@example.com:/home/user /mnt/remote
```

### 设置权限
```bash
# 设置默认权限
sshfs -o default_permissions user@example.com:/home/user /mnt/remote

# 设置 uid 和 gid
sshfs -o uid=1000,gid=1000 user@example.com:/home/user /mnt/remote
```

### 启用压缩
```bash
sshfs -o compression=yes user@example.com:/home/user /mnt/remote
```

### 自动重连
```bash
sshfs -o reconnect user@example.com:/home/user /mnt/remote
```

### 缓存设置
```bash
# 禁用缓存（实时同步）
sshfs -o cache=no user@example.com:/home/user /mnt/remote

# 设置缓存超时时间（秒）
sshfs -o cache_timeout=115200 user@example.com:/home/user /mnt/remote
```

## 高级配置

### 组合多个选项
```bash
sshfs user@example.com:/home/user /mnt/remote \
  -o reconnect,ServerAliveInterval=15,ServerAliveCountMax=3 \
  -o compression=yes \
  -o default_permissions \
  -o IdentityFile=~/.ssh/id_rsa
```

### 通过 SSH 配置文件
在 `~/.ssh/config` 中配置主机：
```
Host myserver
    HostName example.com
    User myuser
    Port 2222
    IdentityFile ~/.ssh/id_rsa
```

然后简化挂载命令：
```bash
sshfs myserver:/home/user /mnt/remote
```

### 开机自动挂载

#### 使用 /etc/fstab (Linux)
```bash
# 编辑 /etc/fstab
sudo nano /etc/fstab

# 添加以下行
user@example.com:/home/user /mnt/remote fuse.sshfs defaults,_netdev,IdentityFile=/home/localuser/.ssh/id_rsa 0 0
```

注意事项：
- 使用 `_netdev` 选项确保网络可用后再挂载
- 需要配置 SSH 密钥认证，避免密码提示
- 确保挂载点目录存在

#### 使用 systemd (Linux)
创建 systemd 服务文件 `/etc/systemd/system/mnt-remote.mount`：
```ini
[Unit]
Description=SSHFS Mount
After=network-online.target
Wants=network-online.target

[Mount]
What=user@example.com:/home/user
Where=/mnt/remote
Type=fuse.sshfs
Options=_netdev,IdentityFile=/home/localuser/.ssh/id_rsa,allow_other,default_permissions

[Install]
WantedBy=multi-user.target
```

启用服务：
```bash
sudo systemctl daemon-reload
sudo systemctl enable mnt-remote.mount
sudo systemctl start mnt-remote.mount
```

## 性能优化

### 提高传输速度
```bash
sshfs user@example.com:/home/user /mnt/remote \
  -o Ciphers=aes128-ctr \
  -o Compression=no \
  -o cache=yes \
  -o kernel_cache \
  -o large_read
```

### 减少延迟
```bash
sshfs user@example.com:/home/user /mnt/remote \
  -o cache_timeout=115200 \
  -o attr_timeout=115200 \
  -o entry_timeout=1200 \
  -o max_readahead=90000
```

## 常见问题

### 权限被拒绝
确保：
1. SSH 密钥配置正确
2. 远程目录有访问权限
3. 使用 `-o allow_other` 选项（如果需要）

### 挂载点忙碌
```bash
# 强制卸载
fusermount -uz /mnt/remote
# 或
sudo umount -l /mnt/remote
```

### 连接超时
```bash
# 添加保活选项
sshfs user@example.com:/home/user /mnt/remote \
  -o ServerAliveInterval=15 \
  -o ServerAliveCountMax=3
```

### 文件系统只读
检查远程目录权限和磁盘空间：
```bash
ssh user@example.com "df -h && ls -ld /home/user"
```

## 安全建议

1. **使用 SSH 密钥认证**：避免在命令行中暴露密码
2. **限制访问权限**：使用 `default_permissions` 选项
3. **使用非标准端口**：减少暴力攻击风险
4. **定期更新**：保持 SSHFS 和 SSH 软件最新
5. **监控日志**：检查 `/var/log/auth.log` 或 `journalctl`

## 与其他工具对比

| 特性 | SSHFS | NFS | SMB/CIFS | rsync |
|------|-------|-----|----------|-------|
| 加密 | ✓ | ✗ | ✓ | ✓ |
| 跨平台 | ✓ | ✓ | ✓ | ✓ |
| 实时同步 | ✓ | ✓ | ✓ | ✗ |
| 性能 | 中 | 高 | 中 | N/A |
| 配置复杂度 | 低 | 中 | 中 | 低 |
| 防火墙友好 | ✓ | ✗ | ✗ | ✓ |

## 实用场景

### 远程开发
```bash
# 挂载远程项目目录
sshfs dev@server:/var/www/project ~/remote-project
# 使用本地 IDE 编辑远程文件
```

### 备份文件
```bash
# 挂载备份服务器
sshfs backup@nas:/backups /mnt/backups
# 复制文件到备份目录
cp -r ~/important-data /mnt/backups/
```

### 访问日志文件
```bash
# 挂载日志目录
sshfs admin@server:/var/log /mnt/logs
# 实时查看日志
tail -f /mnt/logs/syslog
```

## 参考资源

- [SSHFS GitHub](https://github.com/libfuse/sshfs)
- [FUSE 文档](https://www.kernel.org/doc/html/latest/filesystems/fuse.html)
- [SSH 配置指南](https://www.ssh.com/academy/ssh/config)
