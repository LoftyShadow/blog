# Niri 下微信和飞书的剪贴板同步

## 问题背景

在 `niri` 这类 Wayland 合成器下，很多日常应用已经是 Wayland 原生客户端，但微信、飞书、QQ 这类桌面程序经常仍然通过 `X11/Xwayland` 运行。

这时会遇到几类看起来像应用问题、实际是剪贴板和沙盒边界导致的问题：

- Wayland 应用里复制了文本或图片，微信、飞书里粘贴不上。
- 微信里复制图片，再粘贴到另一个聊天，只出现 `file:///...jpg` 文件地址，不出现图片。
- Flatpak 微信保存图片到普通文件夹失败。

核心原因有两层：

- Wayland 剪贴板和 X11 剪贴板是两套机制，系统不会总是自动双向同步。
- Flatpak 微信的文件路径有沙盒映射，微信内部看到的路径不一定是宿主机真实路径。

## 环境判断

先确认当前会话和微信运行方式：

```bash
echo "$XDG_CURRENT_DESKTOP"
echo "$XDG_SESSION_TYPE"
flatpak info --show-permissions com.tencent.WeChat
pgrep -af 'wechat|WeChat|Xwayland|xwayland'
```

本机微信 Flatpak 的关键点是：

```text
QT_QPA_PLATFORM=xcb
sockets=x11
persistent=.xwechat;xwechat_files
```

也就是微信实际走的是 X11/Xwayland。它在沙盒内看到的：

```text
/home/niemingzhi/xwechat_files
```

对应宿主机真实目录：

```text
/home/niemingzhi/.var/app/com.tencent.WeChat/xwechat_files
```

## 现象判断

### 查看 Wayland 剪贴板

```bash
wl-paste --list-types
wl-paste -n
```

### 查看 X11 剪贴板

```bash
env DISPLAY=:0 xclip -selection clipboard -o -target TARGETS
env DISPLAY=:0 xsel -ob
```

如果 `wl-paste` 能读到内容，但 X11 侧为空，通常说明 Wayland 内容没有同步到 X11。

如果复制微信图片后看到类似下面的内容：

```text
file:///home/niemingzhi/xwechat_files/wxid_xxx/temp/RWTemp/2026-05/xxx/xxx.jpg
```

并且剪贴板类型只有：

```text
TEXT
UTF8_STRING
STRING
```

没有：

```text
image/png
image/jpeg
```

那就说明当前剪贴板里不是图片数据，而是一段文件 URI 文本。微信再次粘贴时自然只能粘出路径。

## Flatpak 微信保存目录权限

微信 Flatpak 默认可能只有只读下载目录权限，例如：

```text
filesystems=xdg-download:ro
```

这样微信不能直接写入 `~/Downloads` 或 `~/Pictures`。

给微信最小可用写入权限：

```bash
flatpak override --user --filesystem=xdg-download --filesystem=xdg-pictures com.tencent.WeChat
```

确认权限：

```bash
flatpak override --user --show com.tencent.WeChat
flatpak info --show-permissions com.tencent.WeChat
```

期望看到：

```text
filesystems=xdg-download;xdg-pictures;
```

如果微信已经在运行，退出并重新打开后新权限才稳定生效。开机自启只要还是通过下面这种方式启动同一个应用 ID，也会继承这个 override：

```text
flatpak run com.tencent.WeChat %U
```

撤销权限：

```bash
flatpak override --user --reset com.tencent.WeChat
```

## 解决方案

使用一个用户级 `systemd` 服务常驻运行剪贴板同步脚本。

这个脚本做四件事：

1. 监听 Wayland 文本剪贴板，同步到 X11。
2. 监听 Wayland PNG 图片剪贴板，同步到 X11。
3. 轮询 X11 剪贴板，把文本或图片同步回 Wayland。
4. 如果剪贴板文本是 `file://...` 图片 URI，就把它解析成真实图片文件，转换成 `image/png` 后再同步。

需要的命令：

```text
wl-copy
wl-paste
xsel
xclip
magick 或 convert
file
```

## 脚本文件

路径：

```text
~/.local/bin/clipboard-sync
```

内容：

```bash
#!/bin/bash
set -euo pipefail

state_dir="${XDG_RUNTIME_DIR:-/run/user/$(id -u)}/clipboard-sync"
hash_file="$state_dir/last_hash"
lock_file="$state_dir/lock"
x11_display="${DISPLAY:-:0}"
type_file="$state_dir/last_type"
home_dir="${HOME:-/home/niemingzhi}"
wechat_sandbox_files="$home_dir/xwechat_files/"
wechat_host_files="$home_dir/.var/app/com.tencent.WeChat/xwechat_files/"

mkdir -p "$state_dir"
exec 9>"$lock_file"

last_hash() {
  if [ -f "$hash_file" ]; then
    cat "$hash_file"
  fi
}

remember_hash() {
  printf '%s' "$1" >"$hash_file"
}

last_type() {
  if [ -f "$type_file" ]; then
    cat "$type_file"
  fi
}

remember_type() {
  printf '%s' "$1" >"$type_file"
}

hash_of_file() {
  sha256sum "$1" | awk '{print $1}'
}

decode_file_uri() {
  local uri="$1"
  uri="${uri//$'\r'/}"
  uri="${uri//$'\n'/}"

  case "$uri" in
    file://*) ;;
    *) return 1 ;;
  esac

  uri="${uri#file://}"
  printf '%b' "${uri//%/\\x}"
}

host_path_for_clipboard_file() {
  local clipboard_path="$1"

  case "$clipboard_path" in
    "$wechat_sandbox_files"*)
      printf '%s%s' "$wechat_host_files" "${clipboard_path#"$wechat_sandbox_files"}"
      ;;
    *)
      printf '%s' "$clipboard_path"
      ;;
  esac
}

image_from_text_clipboard() {
  local text_file="$1"
  local output_file="$2"
  local file_uri
  local clipboard_path
  local host_path
  local mime_type

  file_uri="$(awk '{ gsub(/\r/, "\n"); if ($0 ~ /^file:\/\//) { print; exit } }' "$text_file")"
  if [ -z "$file_uri" ]; then
    return 1
  fi

  clipboard_path="$(decode_file_uri "$file_uri")"
  host_path="$(host_path_for_clipboard_file "$clipboard_path")"

  if [ ! -f "$host_path" ]; then
    return 1
  fi

  mime_type="$(file --brief --mime-type "$host_path" 2>/dev/null || true)"
  case "$mime_type" in
    image/*) ;;
    *) return 1 ;;
  esac

  if command -v magick >/dev/null 2>&1; then
    magick "$host_path" "png:$output_file"
  elif command -v convert >/dev/null 2>&1; then
    convert "$host_path" "png:$output_file"
  elif [ "$mime_type" = "image/png" ]; then
    cp "$host_path" "$output_file"
  else
    return 1
  fi
}

sync_stdin_to_x11() {
  local selected_type="$1"
  if [ "${CLIPBOARD_STATE:-data}" != "data" ]; then
    exit 0
  fi

  local tmp
  local data_file
  local image_tmp=""
  local new_hash
  tmp="$(mktemp "$state_dir/wayland.XXXXXX")"
  cat >"$tmp"
  data_file="$tmp"

  if [ ! -s "$tmp" ]; then
    rm -f "$tmp"
    exit 0
  fi

  if [ "$selected_type" = "text/plain" ]; then
    image_tmp="$(mktemp "$state_dir/wayland-image.XXXXXX.png")"
    if image_from_text_clipboard "$tmp" "$image_tmp"; then
      selected_type="image/png"
      data_file="$image_tmp"
    else
      rm -f "$image_tmp"
      image_tmp=""
    fi
  fi

  new_hash="$(hash_of_file "$data_file")"

  flock 9
  if [ "$new_hash" != "$(last_hash)" ] || [ "$selected_type" != "$(last_type)" ]; then
    case "$selected_type" in
      image/*)
        env DISPLAY="$x11_display" xclip -selection clipboard -target "$selected_type" -in <"$data_file"
        ;;
      *)
        env DISPLAY="$x11_display" xsel --clipboard --input <"$data_file"
        ;;
    esac
    remember_hash "$new_hash"
    remember_type "$selected_type"
  fi
  flock -u 9

  rm -f "$tmp" "$image_tmp"
}

choose_x11_target() {
  local targets
  local image_target
  targets="$(timeout 0.5s env DISPLAY="$x11_display" xclip -selection clipboard -o -target TARGETS 2>/dev/null || true)"
  image_target="$(awk '/^image\// { print; exit }' <<<"$targets")"

  if [ -n "$image_target" ]; then
    printf '%s\n' "$image_target"
    return
  fi

  if awk '($0 == "UTF8_STRING" || $0 == "text/plain" || $0 == "TEXT" || $0 == "STRING") { found=1 } END { exit !found }' <<<"$targets"; then
    printf '%s\n' 'text/plain'
    return
  fi
}

poll_x11_once() {
  local tmp
  local image_tmp=""
  local new_hash
  local selected_type
  local converted_from_text=0
  tmp="$(mktemp "$state_dir/x11.XXXXXX")"
  selected_type="$(choose_x11_target || true)"

  if [ -z "$selected_type" ]; then
    rm -f "$tmp"
    return
  fi

  if [ "$selected_type" = 'image/png' ] || [ "$selected_type" = 'image/jpeg' ]; then
    if ! timeout 0.5s env DISPLAY="$x11_display" xclip -selection clipboard -o -target "$selected_type" >"$tmp" 2>/dev/null; then
      rm -f "$tmp"
      return
    fi
  elif ! env DISPLAY="$x11_display" xsel --clipboard --output --selectionTimeout 200 >"$tmp" 2>/dev/null; then
    rm -f "$tmp"
    return
  fi

  if [ ! -s "$tmp" ]; then
    rm -f "$tmp"
    return
  fi

  case "$selected_type" in
    image/*) ;;
    *)
      image_tmp="$(mktemp "$state_dir/x11-image.XXXXXX.png")"
      if image_from_text_clipboard "$tmp" "$image_tmp"; then
        rm -f "$tmp"
        tmp="$image_tmp"
        image_tmp=""
        selected_type="image/png"
        converted_from_text=1
      else
        rm -f "$image_tmp"
        image_tmp=""
      fi
      ;;
  esac

  new_hash="$(hash_of_file "$tmp")"

  flock 9
  if [ "$new_hash" != "$(last_hash)" ] || [ "$selected_type" != "$(last_type)" ]; then
    if [ "$converted_from_text" -eq 1 ]; then
      env DISPLAY="$x11_display" xclip -selection clipboard -target "$selected_type" -in <"$tmp"
    fi
    wl-copy --type "$selected_type" <"$tmp"
    remember_hash "$new_hash"
    remember_type "$selected_type"
  fi
  flock -u 9

  rm -f "$tmp" "$image_tmp"
}

poll_x11_forever() {
  while sleep 0.5; do
    poll_x11_once
  done
}

run_daemon() {
  wl-paste --type text --watch "$0" sync-text-from-wayland &
  local text_watcher_pid=$!

  wl-paste --type image/png --watch "$0" sync-png-from-wayland &
  local png_watcher_pid=$!

  trap "kill $text_watcher_pid $png_watcher_pid 2>/dev/null || true" EXIT INT TERM
  poll_x11_forever
}

case "${1:-daemon}" in
  daemon)
    run_daemon
    ;;
  sync-text-from-wayland)
    sync_stdin_to_x11 text/plain
    ;;
  sync-png-from-wayland)
    sync_stdin_to_x11 image/png
    ;;
  *)
    echo "usage: $0 [daemon|sync-text-from-wayland|sync-png-from-wayland]" >&2
    exit 2
    ;;
esac
```

授权：

```bash
chmod +x ~/.local/bin/clipboard-sync
bash -n ~/.local/bin/clipboard-sync
```

## systemd 用户服务

路径：

```text
~/.config/systemd/user/clipboard-sync.service
```

内容：

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

启用：

```bash
systemctl --user daemon-reload
systemctl --user enable --now clipboard-sync.service
```

重启：

```bash
systemctl --user restart clipboard-sync.service
```

查看状态：

```bash
systemctl --user status clipboard-sync.service
```

查看日志：

```bash
journalctl --user -u clipboard-sync.service --no-pager -n 80
```

## 验证方法

### 文本：Wayland 到 X11

```bash
printf 'wayland-auto-sync-check' | wl-copy
sleep 1
env DISPLAY=:0 xsel -ob
```

### 文本：X11 到 Wayland

```bash
printf 'x11-auto-sync-check' | env DISPLAY=:0 xsel -ib
sleep 1
wl-paste -n
```

### 图片：Wayland 到 X11

```bash
wl-copy --type image/png </tmp/test.png
sleep 1
env DISPLAY=:0 xclip -selection clipboard -o -target image/png >/tmp/from-x11.png
file /tmp/from-x11.png
```

### 图片：X11 到 Wayland

```bash
env DISPLAY=:0 xclip -selection clipboard -target image/png -in </tmp/test.png
sleep 1
wl-paste --type image/png >/tmp/from-wayland.png
file /tmp/from-wayland.png
```

### 微信 file URI 图片路径转换

先从微信缓存里找一张最近的图片：

```bash
find ~/.var/app/com.tencent.WeChat/xwechat_files \
  -path '*temp/RWTemp*' \
  -type f \
  \( -name '*.jpg' -o -name '*.jpeg' -o -name '*.png' \) \
  -printf '%T@ %p\n' |
  sort -nr |
  sed -n '1p'
```

假设找到的宿主机路径是：

```text
/home/niemingzhi/.var/app/com.tencent.WeChat/xwechat_files/wxid_xxx/temp/RWTemp/2026-05/xxx/xxx.jpg
```

对应微信沙盒里的 URI 是：

```text
file:///home/niemingzhi/xwechat_files/wxid_xxx/temp/RWTemp/2026-05/xxx/xxx.jpg
```

模拟微信把这个 URI 放进 X11 剪贴板：

```bash
printf 'file:///home/niemingzhi/xwechat_files/wxid_xxx/temp/RWTemp/2026-05/xxx/xxx.jpg' |
  env DISPLAY=:0 xclip -selection clipboard -target text/plain -in

sleep 1
wl-paste --list-types
env DISPLAY=:0 xclip -selection clipboard -o -target TARGETS
```

期望结果：

```text
image/png
```

同时 X11 侧应该能读出图片数据：

```bash
env DISPLAY=:0 xclip -selection clipboard -o -target image/png | wc -c
```

## 常见排查

### 1. 服务是否在跑

```bash
systemctl --user is-active clipboard-sync.service
pgrep -af 'clipboard-sync|wl-paste --watch'
```

正常情况下应该有：

```text
clipboard-sync daemon
wl-paste --type text --watch ...
wl-paste --type image/png --watch ...
```

### 2. 不要同时跑多套同步脚本

如果手动调试时又起了一份同步脚本，可能出现：

- 多个 watcher 同时占用剪贴板。
- 文本和图片状态互相覆盖。
- 服务是 `active`，但行为不稳定。

排查：

```bash
ps -ef | rg 'clipboard-sync|wl-paste --watch|xclip|xsel'
```

### 3. 微信复制图片仍然是路径

先看剪贴板类型：

```bash
wl-paste --list-types
env DISPLAY=:0 xclip -selection clipboard -o -target TARGETS
```

如果仍然只有文本类型，再看文本内容：

```bash
wl-paste --type text
env DISPLAY=:0 xclip -selection clipboard -o -target UTF8_STRING
```

如果 URI 指向 `xwechat_files`，但脚本没有转成图片，重点检查：

- 宿主机真实文件是否存在。
- `magick` 或 `convert` 是否可用。
- `journalctl --user -u clipboard-sync.service` 是否有脚本错误。

### 4. 微信进程状态

已经启动很久的微信有时会缓存剪贴板状态。服务正常但微信仍然粘贴异常时，可以彻底退出微信再开。

查看微信进程：

```bash
flatpak ps --columns=application,pid | rg WeChat
pgrep -af 'wechat|WeChat'
```

### 5. Flatpak portal 日志

`niri` 环境下可能看到类似：

```text
Could not get window list
Inhibiting other than idle not supported
```

这通常是 portal 后端能力提示，不影响普通剪贴板和保存图片。只有文件选择器、截图、录屏、通知、后台运行等能力异常时，才需要继续查 portal。

## 适用范围

这套方案适合：

- `niri`、`sway` 等 Wayland 合成器。
- 微信、飞书、QQ 等通过 Xwayland 运行的应用。
- 需要在 Wayland 原生应用和 X11 应用之间同步文本、PNG 图片的场景。
- Flatpak 微信复制图片时只给出 `file://...xwechat_files...jpg` 的场景。

## 限制

当前重点处理：

- 纯文本
- `image/png`
- `image/jpeg`
- 指向本机真实图片的 `file://` URI
- Flatpak 微信的 `xwechat_files` 路径映射

不保证处理：

- 私有 MIME 类型
- 富文本
- HTML 片段
- 多文件列表
- 远程 URI
- 已被微信清理掉的临时图片文件

## 小结

在 `niri + Xwayland + Flatpak 微信` 的组合下，微信和飞书粘贴异常通常不是单一原因：

- Wayland 和 X11 剪贴板需要桥接。
- 微信复制图片时可能只给出沙盒内 `file://` 路径。
- Flatpak 保存文件还需要明确的目录写权限。

用用户级 `systemd` 服务做剪贴板双向同步，并把微信图片 URI 转换成真正的 `image/png` 剪贴板数据后，微信和飞书的大部分复制粘贴问题都能压下去。
