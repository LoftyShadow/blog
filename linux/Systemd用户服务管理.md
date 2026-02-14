# Systemd 用户服务管理

## 概述

Systemd 除了管理系统级服务外，还支持用户级服务（user service）。用户服务不需要 root 权限，跟随用户会话启动和停止，适合管理个人的后台程序、通知桥接、同步工具等。

## 与系统服务的区别

| 对比项 | 系统服务 | 用户服务 |
|--------|---------|---------|
| 配置目录 | `/etc/systemd/system/` | `~/.config/systemd/user/` |
| 操作命令 | `sudo systemctl ...` | `systemctl --user ...` |
| 权限要求 | root | 当前用户 |
| 生命周期 | 跟随系统 | 跟随用户会话 |
| 环境变量 | 系统环境 | 用户环境（含 DBUS_SESSION_BUS_ADDRESS 等） |

## 创建用户服务

### 1. 编写服务文件

服务文件放在 `~/.config/systemd/user/` 目录下，以 `.service` 结尾。

```ini
[Unit]
Description=服务描述
After=graphical-session.target

[Service]
ExecStart=/usr/bin/python3 /path/to/your/script.py
Restart=on-failure
RestartSec=5

[Install]
WantedBy=graphical-session.target
```

### 2. 三个段落说明

**[Unit] 段 — 服务元信息**

- `Description`：服务描述
- `After`：在哪个 target 之后启动，常用值：
  - `graphical-session.target` — 图形会话就绪后（推荐桌面应用使用）
  - `default.target` — 默认 target
  - `network-online.target` — 网络就绪后（需要网络的服务）

**[Service] 段 — 运行配置**

- `ExecStart`：启动命令（必须使用绝对路径）
- `Restart`：重启策略
  - `no` — 不重启（默认）
  - `on-failure` — 非正常退出时重启
  - `always` — 总是重启
- `RestartSec`：重启间隔秒数
- `Environment`：设置环境变量，如 `Environment=FOO=bar`
- `WorkingDirectory`：工作目录

**[Install] 段 — 安装配置**

- `WantedBy`：enable 时挂载到哪个 target，常用值：
  - `graphical-session.target` — 图形会话启动时
  - `default.target` — 用户登录时

## 常用命令

```bash
# 重新加载配置（修改 .service 文件后必须执行）
systemctl --user daemon-reload

# 启动服务
systemctl --user start 服务名

# 停止服务
systemctl --user stop 服务名

# 重启服务
systemctl --user restart 服务名

# 查看状态
systemctl --user status 服务名

# 设置开机自启
systemctl --user enable 服务名

# 启动并设置自启（二合一）
systemctl --user enable --now 服务名

# 取消自启
systemctl --user disable 服务名

# 查看日志
journalctl --user -u 服务名

# 实时查看日志
journalctl --user -u 服务名 -f

# 列出所有用户服务
systemctl --user list-units --type=service
```

## 实战示例：微信通知桥接服务

Linux 微信在非 GNOME 环境下不发桌面通知，只闪烁托盘图标。通过监听 D-Bus 的 `StatusNotifierItem` 信号，检测到图标闪烁时自动发送桌面通知。

**脚本位置：** `~/.local/bin/wechat-notify.py`

**服务文件：** `~/.config/systemd/user/wechat-notify.service`

```ini
[Unit]
Description=WeChat notification bridge
After=graphical-session.target

[Service]
ExecStart=/usr/bin/python3 /home/用户名/.local/bin/wechat-notify.py
Restart=on-failure
RestartSec=5

[Install]
WantedBy=graphical-session.target
```

**启用：**

```bash
systemctl --user daemon-reload
systemctl --user enable --now wechat-notify.service
```

## 调试技巧

### 服务启动失败

```bash
# 查看详细错误
systemctl --user status 服务名
journalctl --user -u 服务名 --no-pager -n 50
```

### 常见问题

1. **ExecStart 路径必须是绝对路径** — 不能用 `~` 或相对路径
2. **脚本需要可执行权限** — `chmod +x script.py`
3. **修改 .service 文件后必须 daemon-reload** — 否则不会生效
4. **环境变量问题** — 用户服务的环境变量和终端不同，可用 `Environment=` 显式设置，或用 `systemctl --user show-environment` 查看当前环境

### 验证服务文件语法

```bash
systemd-analyze --user verify ~/.config/systemd/user/服务名.service
```

## 服务文件存放位置优先级

| 路径 | 说明 | 优先级 |
|------|------|--------|
| `~/.config/systemd/user/` | 用户自定义 | 最高 |
| `/etc/systemd/user/` | 系统管理员为所有用户配置 | 中 |
| `/usr/lib/systemd/user/` | 软件包安装 | 最低 |
