# Tmux快速入门

## 什么是Tmux

Tmux（Terminal Multiplexer）是一个终端复用工具，允许用户在单个终端窗口中创建、访问和控制多个终端会话。它的主要优势包括：

- **会话持久化**：即使断开SSH连接，tmux会话仍在后台运行
- **多窗口管理**：在一个终端中同时运行多个程序
- **窗格分割**：将窗口分割成多个窗格，同时查看多个终端
- **会话共享**：多个用户可以连接到同一个tmux会话

## 安装Tmux

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install tmux
```

### CentOS/RHEL
```bash
sudo yum install tmux
```

### macOS
```bash
brew install tmux
```

## 基本概念

Tmux有三个层级概念：

1. **Session（会话）**：一个tmux会话可以包含多个窗口
2. **Window（窗口）**：一个窗口可以包含多个窗格
3. **Pane（窗格）**：最小的操作单元，每个窗格是一个独立的终端

## 会话管理

### 创建会话
```bash
# 创建一个新会话
tmux

# 创建一个命名会话
tmux new -s session_name

# 创建会话并指定窗口名称
tmux new -s session_name -n window_name
```

### 查看会话
```bash
# 列出所有会话
tmux ls
# 或
tmux list-sessions
```

### 连接会话
```bash
# 连接到最近的会话
tmux attach
# 或
tmux a

# 连接到指定会话
tmux attach -t session_name
# 或
tmux a -t session_name
```

### 断开会话
```bash
# 在tmux内部断开当前会话（会话继续在后台运行）
Ctrl+b d
```

### 删除会话
```bash
# 删除指定会话
tmux kill-session -t session_name

# 删除所有会话
tmux kill-server
```

## 快捷键操作

Tmux的所有快捷键都需要先按前缀键（默认是 `Ctrl+b`），然后再按功能键。

### 窗口操作

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+b c` | 创建新窗口 |
| `Ctrl+b ,` | 重命名当前窗口 |
| `Ctrl+b w` | 列出所有窗口 |
| `Ctrl+b n` | 切换到下一个窗口 |
| `Ctrl+b p` | 切换到上一个窗口 |
| `Ctrl+b 0-9` | 切换到指定编号的窗口 |
| `Ctrl+b &` | 关闭当前窗口 |

### 窗格操作

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+b %` | 垂直分割窗格 |
| `Ctrl+b "` | 水平分割窗格 |
| `Ctrl+b o` | 切换到下一个窗格 |
| `Ctrl+b ;` | 切换到上一个窗格 |
| `Ctrl+b 方向键` | 切换到指定方向的窗格 |
| `Ctrl+b x` | 关闭当前窗格 |
| `Ctrl+b z` | 最大化/还原当前窗格 |
| `Ctrl+b {` | 当前窗格与上一个窗格交换位置 |
| `Ctrl+b }` | 当前窗格与下一个窗格交换位置 |
| `Ctrl+b Ctrl+o` | 所有窗格向前移动一个位置 |
| `Ctrl+b 空格` | 在预设的窗格布局中循环切换 |

### 会话操作

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+b d` | 断开当前会话 |
| `Ctrl+b s` | 列出所有会话 |
| `Ctrl+b $` | 重命名当前会话 |
| `Ctrl+b (` | 切换到上一个会话 |
| `Ctrl+b )` | 切换到下一个会话 |

### 其他操作

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+b ?` | 显示所有快捷键帮助 |
| `Ctrl+b t` | 显示时钟 |
| `Ctrl+b [` | 进入复制模式（可以滚动查看历史输出） |
| `Ctrl+b ]` | 粘贴复制的内容 |

## 配置文件

Tmux的配置文件位于 `~/.tmux.conf`，可以自定义各种设置。

### 常用配置示例

```bash
# 修改前缀键为 Ctrl+a
set -g prefix C-a
unbind C-b
bind C-a send-prefix

# 从1开始编号窗口和窗格（默认从0开始）
set -g base-index 1
setw -g pane-base-index 1

# 启用鼠标支持
set -g mouse on

# 设置历史记录行数
set -g history-limit 10000

# 快速重载配置文件
bind r source-file ~/.tmux.conf \; display "配置已重载!"

# 使用更直观的分割快捷键
bind | split-window -h
bind - split-window -v

# 使用vim风格的窗格切换
bind h select-pane -L
bind j select-pane -D
bind k select-pane -U
bind l select-pane -R

# 设置状态栏样式
set -g status-bg black
set -g status-fg white
set -g status-left '#[fg=green]#S '
set -g status-right '#[fg=yellow]%Y-%m-%d %H:%M'
```

### 应用配置
```bash
# 在tmux内部重载配置
Ctrl+b :
source-file ~/.tmux.conf

# 或使用命令
tmux source-file ~/.tmux.conf
```

## 实用技巧

### 1. 复制模式
进入复制模式后，可以使用vim风格的键盘操作：
- `Ctrl+b [` 进入复制模式
- `空格` 开始选择
- `Enter` 复制选中内容
- `Ctrl+b ]` 粘贴

### 2. 窗格同步
在多个窗格中同时执行相同命令：
```bash
# 开启同步
Ctrl+b :setw synchronize-panes on

# 关闭同步
Ctrl+b :setw synchronize-panes off
```

### 3. 调整窗格大小
```bash
Ctrl+b :resize-pane -D 5  # 向下调整5行
Ctrl+b :resize-pane -U 5  # 向上调整5行
Ctrl+b :resize-pane -L 5  # 向左调整5列
Ctrl+b :resize-pane -R 5  # 向右调整5列
```

### 4. 保存和恢复会话
使用tmux-resurrect插件可以保存和恢复tmux会话：
```bash
# 安装TPM（Tmux Plugin Manager）
git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm

# 在 ~/.tmux.conf 中添加
set -g @plugin 'tmux-plugins/tpm'
set -g @plugin 'tmux-plugins/tmux-resurrect'

# 重载配置后按 Ctrl+b I 安装插件
# Ctrl+b Ctrl+s 保存会话
# Ctrl+b Ctrl+r 恢复会话
```

## 常见使用场景

### 1. 远程服务器开发
```bash
# 创建开发会话
tmux new -s dev

# 分割窗格：一个用于编辑，一个用于运行
Ctrl+b %

# 断开连接
Ctrl+b d

# 稍后重新连接
tmux a -t dev
```

### 2. 监控多个日志文件
```bash
# 创建监控会话
tmux new -s monitor

# 水平分割多个窗格
Ctrl+b "
Ctrl+b "

# 在每个窗格中查看不同的日志
tail -f /var/log/app1.log
tail -f /var/log/app2.log
tail -f /var/log/app3.log
```

### 3. 长时间运行的任务
```bash
# 启动tmux会话
tmux new -s backup

# 运行备份任务
./long-running-backup.sh

# 断开连接，任务继续运行
Ctrl+b d

# 稍后检查进度
tmux a -t backup
```

## 总结

Tmux是一个强大的终端管理工具，特别适合：
- 需要长时间运行任务的场景
- 远程服务器管理
- 需要同时查看多个终端输出
- 团队协作和结对编程

掌握基本的会话、窗口和窗格操作，就能大大提升终端使用效率。
