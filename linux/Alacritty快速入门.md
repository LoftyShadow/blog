# Alacritty快速入门

## 什么是Alacritty

Alacritty是一个现代化的、跨平台的GPU加速终端模拟器。它的主要特点包括：

- **高性能**：使用GPU加速渲染，响应速度极快
- **跨平台**：支持Linux、macOS和Windows
- **简洁配置**：使用YAML格式的配置文件
- **Vi模式**：内置Vi模式支持，方便文本选择和复制
- **真彩色支持**：完整的24位真彩色支持

## 安装Alacritty

### Ubuntu/Debian
```bash
# 添加PPA源
sudo add-apt-repository ppa:aslatter/ppa
sudo apt update
sudo apt install alacritty

# 或使用snap安装
sudo snap install alacritty --classic
```

### Fedora
```bash
sudo dnf install alacritty
```

### Arch Linux
```bash
sudo pacman -S alacritty
```

### macOS
```bash
brew install --cask alacritty
```

### Windows
```bash
# 使用Scoop安装
scoop install alacritty

# 或使用Chocolatey
choco install alacritty
```

### 从源码编译
```bash
# 安装Rust工具链
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 克隆仓库并编译
git clone https://github.com/alacritty/alacritty.git
cd alacritty
cargo build --release
```

## 配置文件

Alacritty的配置文件位置：
- **Linux/macOS**: `~/.config/alacritty/alacritty.toml` 或 `~/.config/alacritty/alacritty.yml`
- **Windows**: `%APPDATA%\alacritty\alacritty.toml` 或 `%APPDATA%\alacritty\alacritty.yml`

### 创建配置文件
```bash
# Linux/macOS
mkdir -p ~/.config/alacritty
touch ~/.config/alacritty/alacritty.toml
```

## 基础配置示例

### TOML格式配置（推荐）

```toml
# 窗口配置
[window]
# 窗口尺寸
dimensions = { columns = 120, lines = 30 }

# 窗口边距
padding = { x = 10, y = 10 }

# 窗口装饰
decorations = "full"  # full, none, transparent, buttonless

# 启动模式
startup_mode = "Windowed"  # Windowed, Maximized, Fullscreen

# 窗口标题
title = "Alacritty"

# 动态标题
dynamic_title = true

# 字体配置
[font]
# 字体大小
size = 12.0

# 普通字体
normal = { family = "JetBrains Mono", style = "Regular" }

# 粗体字体
bold = { family = "JetBrains Mono", style = "Bold" }

# 斜体字体
italic = { family = "JetBrains Mono", style = "Italic" }

# 粗斜体字体
bold_italic = { family = "JetBrains Mono", style = "Bold Italic" }

# 字体偏移
offset = { x = 0, y = 0 }

# 字形偏移
glyph_offset = { x = 0, y = 0 }

# 颜色配置
[colors]
# 主要颜色
[colors.primary]
background = "#1e1e1e"
foreground = "#d4d4d4"

# 光标颜色
[colors.cursor]
text = "#1e1e1e"
cursor = "#d4d4d4"

# 选择颜色
[colors.selection]
text = "CellForeground"
background = "#264f78"

# 普通颜色
[colors.normal]
black = "#1e1e1e"
red = "#f44747"
green = "#4ec9b0"
yellow = "#ffcc00"
blue = "#0078d4"
magenta = "#bc3fbc"
cyan = "#11a8cd"
white = "#d4d4d4"

# 高亮颜色
[colors.bright]
black = "#666666"
red = "#f44747"
green = "#4ec9b0"
yellow = "#ffcc00"
blue = "#0078d4"
magenta = "#bc3fbc"
cyan = "#11a8cd"
white = "#ffffff"

# 滚动配置
[scrolling]
# 历史记录行数
history = 10000

# 每次滚动的行数
multiplier = 3

# 光标配置
[cursor]
# 光标样式: Block, Underline, Beam
style = { shape = "Block", blinking = "On" }

# 光标闪烁间隔（毫秒）
blink_interval = 750

# 未聚焦时的光标样式
unfocused_hollow = true

# 终端配置
[terminal]
# Shell程序
[terminal.shell]
program = "/bin/bash"
args = ["-l"]

# 环境变量
[env]
TERM = "xterm-256color"

# 鼠标配置
[mouse]
# 隐藏鼠标
hide_when_typing = true

# 选择配置
[selection]
# 保存到剪贴板
save_to_clipboard = true
```

## 常用快捷键

### 默认快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl + Shift + C` | 复制 |
| `Ctrl + Shift + V` | 粘贴 |
| `Ctrl + Shift + F` | 搜索 |
| `Ctrl + Shift + Space` | 进入Vi模式 |
| `Ctrl + Shift + +` | 增大字体 |
| `Ctrl + Shift + -` | 减小字体 |
| `Ctrl + Shift + 0` | 重置字体大小 |
| `Ctrl + Shift + N` | 新建窗口 |
| `Ctrl + Shift + Q` | 退出 |

### Vi模式快捷键

进入Vi模式后（`Ctrl + Shift + Space`），可以使用以下快捷键：

| 快捷键 | 功能 |
|--------|------|
| `h/j/k/l` | 左/下/上/右移动光标 |
| `w/b` | 向前/向后移动一个单词 |
| `0/$` | 移动到行首/行尾 |
| `g/G` | 移动到文档开头/结尾 |
| `v` | 进入可视模式选择文本 |
| `y` | 复制选中的文本 |
| `/` | 搜索 |
| `n/N` | 下一个/上一个搜索结果 |
| `Esc` | 退出Vi模式 |

## 自定义快捷键

可以在配置文件中自定义快捷键绑定：

```toml
[[keyboard.bindings]]
key = "T"
mods = "Control|Shift"
action = "SpawnNewInstance"

[[keyboard.bindings]]
key = "W"
mods = "Control|Shift"
action = "Quit"

[[keyboard.bindings]]
key = "Return"
mods = "Control|Shift"
action = "ToggleFullscreen"
```

## 主题配置

### 流行主题示例

#### Dracula主题
```toml
[colors.primary]
background = "#282a36"
foreground = "#f8f8f2"

[colors.normal]
black = "#000000"
red = "#ff5555"
green = "#50fa7b"
yellow = "#f1fa8c"
blue = "#bd93f9"
magenta = "#ff79c6"
cyan = "#8be9fd"
white = "#bfbfbf"

[colors.bright]
black = "#4d4d4d"
red = "#ff6e67"
green = "#5af78e"
yellow = "#f4f99d"
blue = "#caa9fa"
magenta = "#ff92d0"
cyan = "#9aedfe"
white = "#e6e6e6"
```

#### Nord主题
```toml
[colors.primary]
background = "#2e3440"
foreground = "#d8dee9"

[colors.normal]
black = "#3b4252"
red = "#bf616a"
green = "#a3be8c"
yellow = "#ebcb8b"
blue = "#81a1c1"
magenta = "#b48ead"
cyan = "#88c0d0"
white = "#e5e9f0"

[colors.bright]
black = "#4c566a"
red = "#bf616a"
green = "#a3be8c"
yellow = "#ebcb8b"
blue = "#81a1c1"
magenta = "#b48ead"
cyan = "#8fbcbb"
white = "#eceff4"
```

## 高级配置

### 透明度设置
```toml
[window]
opacity = 0.9  # 0.0 完全透明，1.0 完全不透明
```

### 背景模糊（macOS）
```toml
[window]
blur = true
```

### 自定义Shell
```toml
[terminal.shell]
program = "/usr/bin/zsh"
args = ["-l"]
```

### 工作目录
```toml
[general]
working_directory = "/home/user/projects"
```

## 常见问题

### 1. 字体显示问题
如果字体显示不正常，确保已安装所需字体：
```bash
# 查看可用字体
fc-list | grep "JetBrains"

# 安装JetBrains Mono字体
# Ubuntu/Debian
sudo apt install fonts-jetbrains-mono

# Arch Linux
sudo pacman -S ttf-jetbrains-mono
```

### 2. 中文显示问题
确保配置文件中包含中文字体：
```toml
[font.normal]
family = "JetBrains Mono"

# 添加中文字体作为后备
[font]
builtin_box_drawing = true
```

### 3. 颜色显示不正确
确保TERM环境变量设置正确：
```toml
[env]
TERM = "xterm-256color"
```

### 4. 配置文件不生效
重新加载配置文件：
```bash
# 配置文件会自动重新加载
# 或者重启Alacritty
```

## 实用技巧

### 1. 与Tmux配合使用
```toml
[terminal.shell]
program = "/usr/bin/tmux"
args = ["new-session", "-A", "-s", "main"]
```

### 2. 设置为默认终端（Linux）
```bash
# 使用update-alternatives
sudo update-alternatives --install /usr/bin/x-terminal-emulator x-terminal-emulator /usr/bin/alacritty 50
sudo update-alternatives --config x-terminal-emulator
```

### 3. 创建桌面快捷方式（Linux）
```bash
# 创建desktop文件
cat > ~/.local/share/applications/alacritty.desktop << 'EOF'
[Desktop Entry]
Type=Application
Name=Alacritty
Comment=A fast, cross-platform, OpenGL terminal emulator
Exec=alacritty
Icon=Alacritty
Terminal=false
Categories=System;TerminalEmulator;
EOF
```

### 4. 性能优化
```toml
[window]
# 禁用装饰以提高性能
decorations = "none"

[scrolling]
# 减少历史记录以节省内存
history = 5000

# 禁用平滑滚动
multiplier = 1
```

## 推荐字体

以下是一些适合终端使用的等宽字体：

- **JetBrains Mono** - 专为开发者设计，连字支持好
- **Fira Code** - 优秀的连字支持
- **Cascadia Code** - 微软开发的现代等宽字体
- **Hack** - 清晰易读
- **Source Code Pro** - Adobe开发的经典字体
- **Nerd Fonts** - 包含大量图标的字体补丁

### 安装Nerd Fonts
```bash
# 下载并安装
mkdir -p ~/.local/share/fonts
cd ~/.local/share/fonts
wget https://github.com/ryanoasis/nerd-fonts/releases/download/v3.0.0/JetBrainsMono.zip
unzip JetBrainsMono.zip
fc-cache -fv
```

## 资源链接

- **官方网站**: https://alacritty.org/
- **GitHub仓库**: https://github.com/alacritty/alacritty
- **配置文档**: https://github.com/alacritty/alacritty/blob/master/alacritty.yml
- **主题集合**: https://github.com/alacritty/alacritty-theme

## 总结

Alacritty是一个高性能、现代化的终端模拟器，特别适合：
- 追求极致性能的开发者
- 喜欢简洁配置的用户
- 需要跨平台一致体验的场景
- 与Vim/Neovim配合使用

通过合理的配置，Alacritty可以成为日常开发中最得力的工具之一。

