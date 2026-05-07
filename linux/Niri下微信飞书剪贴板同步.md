# Niri 下微信和飞书的剪贴板同步

## 问题背景

在 `niri` 这类 Wayland 合成器下，微信和飞书经常不是原生 Wayland 客户端，而是通过 `X11/Xwayland` 运行。

这时就会出现一个典型问题：

- Wayland 应用里已经复制了文本或图片
- 微信、飞书这类 `X11` 应用里却粘贴不上

根因通常不是应用本身没有“剪贴板权限”，而是：

- Wayland 剪贴板
- X11 剪贴板

这两套机制没有自动同步。

## 现象判断

如果怀疑是这类问题，可以先分别检查 Wayland 和 X11 当前的剪贴板内容。

### 查看 Wayland 剪贴板内容

```bash
wl-paste -n
```

### 查看 X11 剪贴板内容

```bash
env DISPLAY=:0 xsel -ob
```

如果 `wl-paste -n` 能读到内容，而 `xsel -ob` 为空，通常就说明：

- Wayland 剪贴板有内容
- X11 剪贴板没有同步过去

这时微信、飞书之类走 `X11` 的应用就可能粘贴失败。

## 解决方案

可以在用户会话里常驻一个同步服务，把 `Wayland <-> X11` 的剪贴板做双向同步。

本文使用的是：

- `wl-copy`
- `wl-paste`
- `xsel`
- `xclip`
- `systemd --user`

其中：

- 文本同步使用 `wl-copy/wl-paste + xsel`
- 图片同步使用 `wl-copy/wl-paste + xclip`

## 最终落地

本机最终使用了两个文件：

- 脚本：`~/.local/bin/clipboard-sync`
- 服务：`~/.config/systemd/user/clipboard-sync.service`

服务启动后会做两件事：

1. 监听 Wayland 文本剪贴板变化，同步到 X11
2. 监听 Wayland PNG 图片剪贴板变化，同步到 X11
3. 轮询 X11 剪贴板，把文本或图片同步回 Wayland

## 服务文件

```ini
[Unit]
Description=Sync text clipboard between Wayland and X11
PartOf=graphical-session.target
After=graphical-session.target

[Service]
Type=simple
ExecStart=%h/.local/bin/clipboard-sync daemon
Restart=on-failure
RestartSec=1

[Install]
WantedBy=graphical-session.target
```

## 启用方式

```bash
systemctl --user daemon-reload
systemctl --user enable --now clipboard-sync.service
```

## 常用命令

### 查看服务状态

```bash
systemctl --user status clipboard-sync.service
```

### 查看日志

```bash
journalctl --user -u clipboard-sync.service --no-pager -n 50
```

### 重启服务

```bash
systemctl --user restart clipboard-sync.service
```

### 停止服务

```bash
systemctl --user stop clipboard-sync.service
```

## 验证方法

### 文本：Wayland -> X11

```bash
printf 'wayland-auto-sync-check' | wl-copy
sleep 1
env DISPLAY=:0 xsel -ob
```

### 文本：X11 -> Wayland

```bash
printf 'x11-auto-sync-check' | env DISPLAY=:0 xsel -ib
sleep 1
wl-paste -n
```

### 图片：Wayland -> X11

```bash
wl-copy --type image/png </tmp/test.png
sleep 1
env DISPLAY=:0 xclip -selection clipboard -o -target image/png >/tmp/from-x11.png
```

### 图片：X11 -> Wayland

```bash
env DISPLAY=:0 xclip -selection clipboard -target image/png -in </tmp/test.png
sleep 1
wl-paste --type image/png >/tmp/from-wayland.png
```

## 适用范围

这套方案适合下面这类场景：

- Wayland 桌面环境
- `niri`、`sway` 等使用 Xwayland 跑老应用
- 微信、飞书、QQ 这类本体仍然偏 `X11` 的桌面程序

## 注意事项

### 1. 不是所有内容类型都能同步

当前重点处理的是：

- 文本
- `image/png`

如果某个应用复制的是私有 MIME、文件列表、富文本、HTML 片段，未必能同步。

### 2. 微信是否能粘贴，还取决于它当前进程状态

即使宿主机两边剪贴板已经同步成功，已经启动很久的微信进程有时仍然不认最新状态。

这种情况下，通常需要：

```bash
flatpak ps --columns=application,pid | rg WeChat
```

确认微信实例后，把它彻底退出再重开。

### 3. 不要同时跑多套同步脚本

如果手动调试时又起了一份 `clipboard-sync`，可能会出现：

- 多个 watcher 同时占用剪贴板
- 文本和图片状态互相覆盖
- 明明服务是 running，但同步行为不稳定

排查时可以先看：

```bash
ps -ef | rg 'clipboard-sync|wl-paste --watch'
```

## 小结

在 `niri + Xwayland` 的组合下，微信和飞书粘贴失败，很多时候不是应用权限问题，而是：

- Wayland 剪贴板和 X11 剪贴板本来就是两套机制
- 系统没有自动帮你做同步

用一个用户级 `systemd` 服务把文本和图片剪贴板桥接起来，通常就能把这类问题压下去。
