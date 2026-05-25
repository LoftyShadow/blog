# Niri 下微信和飞书的剪贴板同步

## 使用场景

在 `niri` 这类 Wayland 合成器下，浏览器、终端等程序通常使用 Wayland 剪贴板，微信、飞书等桌面应用可能仍然运行在 X11/Xwayland 里。两边剪贴板不是同一套协议，所以会出现：

- Wayland 程序复制文本或图片后，微信、飞书粘贴不到。
- 微信复制图片时，剪贴板里只有 `file:///...` 路径，粘贴出来不是图片。
- 浏览器复制图片时，剪贴板同时带有图片和文本/HTML，错误同步后可能只剩一段文本。

最终做法是运行一个用户级 `systemd` 服务，常驻桥接 Wayland 和 X11 剪贴板。

## 依赖

需要这些命令：

```bash
wl-copy
wl-paste
xclip
xsel
file
magick
```

Fedora 上可以安装：

```bash
sudo dnf install wl-clipboard xclip xsel file ImageMagick
```

## Flatpak 微信权限

如果微信保存图片到下载或图片目录失败，给 Flatpak 微信增加目录权限：

```bash
flatpak override --user --filesystem=xdg-download --filesystem=xdg-pictures com.tencent.WeChat
```

查看结果：

```bash
flatpak override --user --show com.tencent.WeChat
flatpak info --show-permissions com.tencent.WeChat
```

如果微信已经在运行，退出后重新打开。

## 剪贴板同步脚本

脚本路径：

```text
~/.local/bin/clipboard-sync
```

脚本内容：

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

wayland_has_image_type() {
  wl-paste --list-types 2>/dev/null | awk '/^image\// { found=1 } END { exit !found }'
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
    if wayland_has_image_type; then
      rm -f "$tmp"
      exit 0
    fi

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

  case "$selected_type" in
    image/*)
      if ! timeout 0.5s env DISPLAY="$x11_display" xclip -selection clipboard -o -target "$selected_type" >"$tmp" 2>/dev/null; then
        rm -f "$tmp"
        return
      fi
      ;;
    *)
      if ! env DISPLAY="$x11_display" xsel --clipboard --output --selectionTimeout 200 >"$tmp" 2>/dev/null; then
        rm -f "$tmp"
        return
      fi
      ;;
  esac

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

  wl-paste --type image/png --watch "$0" sync-image-from-wayland image/png &
  local png_watcher_pid=$!

  wl-paste --type image/jpeg --watch "$0" sync-image-from-wayland image/jpeg &
  local jpeg_watcher_pid=$!

  wl-paste --type image/webp --watch "$0" sync-image-from-wayland image/webp &
  local webp_watcher_pid=$!

  trap "kill $text_watcher_pid $png_watcher_pid $jpeg_watcher_pid $webp_watcher_pid 2>/dev/null || true" EXIT INT TERM
  poll_x11_forever
}

case "${1:-daemon}" in
  daemon)
    run_daemon
    ;;
  sync-text-from-wayland)
    sync_stdin_to_x11 text/plain
    ;;
  sync-image-from-wayland)
    sync_stdin_to_x11 "${2:-image/png}"
    ;;
  sync-png-from-wayland)
    sync_stdin_to_x11 image/png
    ;;
  *)
    echo "usage: $0 [daemon|sync-text-from-wayland|sync-image-from-wayland type|sync-png-from-wayland]" >&2
    exit 2
    ;;
esac
```

授权并检查语法：

```bash
chmod +x ~/.local/bin/clipboard-sync
bash -n ~/.local/bin/clipboard-sync
```

## systemd 用户服务

服务路径：

```text
~/.config/systemd/user/clipboard-sync.service
```

服务内容：

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

启用并启动：

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
systemctl --user status clipboard-sync.service --no-pager
```

正常情况下能看到这些进程：

```text
clipboard-sync daemon
wl-paste --type text --watch ...
wl-paste --type image/png --watch ...
wl-paste --type image/jpeg --watch ...
wl-paste --type image/webp --watch ...
```

## 验证

### 文本同步

Wayland 到 X11：

```bash
printf 'wayland-auto-sync-check' | wl-copy --type text/plain
sleep 1
env DISPLAY=:0 xsel --clipboard --output --selectionTimeout 200
```

X11 到 Wayland：

```bash
printf 'x11-auto-sync-check' | env DISPLAY=:0 xsel --clipboard --input
sleep 1
wl-paste -n
```

### 图片同步

Wayland 到 X11：

```bash
magick -size 4x4 xc:red /tmp/clipboard-test.png
wl-copy --type image/png </tmp/clipboard-test.png
sleep 1
env DISPLAY=:0 xclip -selection clipboard -o -target image/png >/tmp/from-x11.png
file --brief --mime-type /tmp/from-x11.png
```

X11 到 Wayland：

```bash
magick -size 4x4 xc:blue /tmp/clipboard-test.png
env DISPLAY=:0 xclip -selection clipboard -target image/png -in </tmp/clipboard-test.png
sleep 1
wl-paste --type image/png >/tmp/from-wayland.png
file --brief --mime-type /tmp/from-wayland.png
```

浏览器复制图片后可以看类型：

```bash
wl-paste --list-types
env DISPLAY=:0 xclip -selection clipboard -o -target TARGETS
```

期望保留 `image/png`、`image/jpeg` 或 `image/webp`，而不是只剩普通文本。

### 微信 file URI 转图片

微信可能把图片复制成这种 URI：

```text
file:///home/niemingzhi/xwechat_files/wxid_xxx/temp/RWTemp/2026-05/xxx/xxx.jpg
```

脚本会把沙盒路径：

```text
/home/niemingzhi/xwechat_files/
```

映射到宿主机路径：

```text
/home/niemingzhi/.var/app/com.tencent.WeChat/xwechat_files/
```

然后读取真实文件并转换成 `image/png` 剪贴板数据。

可以手动模拟：

```bash
printf 'file:///home/niemingzhi/xwechat_files/wxid_xxx/temp/RWTemp/2026-05/xxx/xxx.jpg' |
  env DISPLAY=:0 xclip -selection clipboard -target text/plain -in

sleep 1
wl-paste --list-types
env DISPLAY=:0 xclip -selection clipboard -o -target TARGETS
```

如果 URI 指向真实存在的图片，期望能看到 `image/png`。

## 维护

查看服务日志：

```bash
journalctl --user -u clipboard-sync.service --no-pager -n 80
```

确认没有重复运行多份同步脚本：

```bash
ps -ef | rg 'clipboard-sync|wl-paste --watch|xclip|xsel'
```

更新脚本后重启服务：

```bash
bash -n ~/.local/bin/clipboard-sync
systemctl --user restart clipboard-sync.service
```

停止服务：

```bash
systemctl --user disable --now clipboard-sync.service
```

撤销 Flatpak 微信目录权限：

```bash
flatpak override --user --reset com.tencent.WeChat
```

## 限制

当前方案重点处理：

- 纯文本
- `image/png`
- `image/jpeg`
- `image/webp`
- 指向本机真实图片文件的 `file://` URI
- Flatpak 微信的 `xwechat_files` 路径映射

不处理：

- 私有 MIME 类型
- 富文本
- HTML 片段
- 多文件列表
- 远程 URI
- 已被微信清理掉的临时图片文件
