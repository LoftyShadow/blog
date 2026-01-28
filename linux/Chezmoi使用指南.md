# Chezmoi使用指南

## 简介

Chezmoi 是一个跨平台的点文件（dotfiles）管理工具，可以帮助你在多台机器上同步和管理配置文件。

## 安装

### Linux/macOS
```bash
# 使用脚本安装
sh -c "$(curl -fsLS get.chezmoi.io)"

# 或使用包管理器
# Ubuntu/Debian
sudo apt install chezmoi

# macOS
brew install chezmoi

# Arch Linux
sudo pacman -S chezmoi
```

### Windows
```powershell
# 使用 Scoop
scoop install chezmoi

# 使用 Chocolatey
choco install chezmoi
```

## 初始化

### 从零开始
```bash
# 初始化 chezmoi
chezmoi init

# 初始化并指定 Git 仓库
chezmoi init --apply https://github.com/username/dotfiles.git
```

### 从现有仓库初始化
```bash
# 克隆并应用配置
chezmoi init --apply username

# 等同于
chezmoi init --apply https://github.com/username/dotfiles.git
```

## 基本使用

### 添加文件到 chezmoi
```bash
# 添加单个文件
chezmoi add ~/.bashrc

# 添加整个目录
chezmoi add ~/.config/nvim

# 添加文件并自动提交
chezmoi add ~/.zshrc --autocommit
```

### 编辑文件
```bash
# 使用默认编辑器编辑
chezmoi edit ~/.bashrc

# 编辑后应用更改
chezmoi apply

# 或者一步到位
chezmoi edit --apply ~/.bashrc
```

### 查看变更
```bash
# 查看将要应用的变更
chezmoi diff

# 查看特定文件的变更
chezmoi diff ~/.bashrc
```

### 应用变更
```bash
# 应用所有变更
chezmoi apply

# 应用特定文件
chezmoi apply ~/.bashrc

# 应用前预览
chezmoi apply --dry-run --verbose
```

## 常用命令

### 状态管理
```bash
# 查看状态
chezmoi status

# 查看 chezmoi 管理的文件
chezmoi managed

# 查看源目录位置
chezmoi source-path

# 进入源目录
chezmoi cd
```

### 更新和同步
```bash
# 从远程仓库拉取更新
chezmoi update

# 等同于
chezmoi git pull -- --rebase && chezmoi apply

# 手动同步
chezmoi git pull
chezmoi apply
```

### Git 操作
```bash
# 在源目录执行 git 命令
chezmoi git add .
chezmoi git commit -m "Update dotfiles"
chezmoi git push

# 或者进入源目录手动操作
chezmoi cd
git add .
git commit -m "Update dotfiles"
git push
```

## 模板功能

### 使用模板
Chezmoi 支持 Go 模板语法，文件名以 `.tmpl` 结尾。

```bash
# 添加模板文件
chezmoi add --template ~/.gitconfig
```

### 模板示例

在 `~/.local/share/chezmoi/dot_gitconfig.tmpl` 中：

```
[user]
    name = {{ .name }}
    email = {{ .email }}
[core]
    editor = {{ .editor }}
```

在 `~/.config/chezmoi/chezmoi.toml` 中配置变量：

```toml
[data]
    name = "Your Name"
    email = "your.email@example.com"
    editor = "nvim"
```

### 条件模板
```
{{- if eq .chezmoi.os "linux" }}
# Linux specific config
{{- else if eq .chezmoi.os "darwin" }}
# macOS specific config
{{- end }}
```

## 文件名编码

Chezmoi 使用特殊前缀来标识文件属性：

- `dot_` - 点文件（如 `dot_bashrc` → `.bashrc`）
- `private_` - 私有文件（权限 600）
- `executable_` - 可执行文件（权限 755）
- `symlink_` - 符号链接
- `readonly_` - 只读文件

### 示例
```bash
# .bashrc (普通点文件)
dot_bashrc

# .ssh/config (私有点文件)
private_dot_ssh/config

# .local/bin/script.sh (可执行文件)
dot_local/bin/executable_script.sh
```

## 忽略文件

在 `~/.config/chezmoi/chezmoiignore` 中配置：

```
# 忽略特定文件
.DS_Store
*.swp

# 根据操作系统忽略
{{ if ne .chezmoi.os "darwin" }}
.config/yabai
{{ end }}
```

## 最佳实践

### 1. 使用模板处理敏感信息
```bash
# 使用密码管理器
{{ (bitwarden "item" "github-token").password }}

# 使用环境变量
{{ env "GITHUB_TOKEN" }}
```

### 2. 分离公开和私有配置
```bash
# 公开配置
chezmoi init --apply username/dotfiles

# 私有配置存储在单独的仓库
chezmoi init --apply username/dotfiles-private
```

### 3. 定期同步
```bash
# 创建别名
alias dotfiles='chezmoi'
alias dotfiles-update='chezmoi update'
alias dotfiles-edit='chezmoi edit --apply'
```

### 4. 使用脚本自动化
在 `.chezmoiscripts` 目录下创建脚本：

```bash
# run_once_install-packages.sh
#!/bin/bash
# 只运行一次的脚本

# run_onchange_install-packages.sh
# 文件内容变化时运行

# run_before_install-deps.sh
# 应用前运行

# run_after_setup.sh
# 应用后运行
```

## 常见问题

### 查看 chezmoi 配置
```bash
chezmoi doctor
```

### 重新应用所有文件
```bash
chezmoi apply --force
```

### 删除 chezmoi 管理的文件
```bash
# 从 chezmoi 移除但保留文件
chezmoi forget ~/.bashrc

# 从 chezmoi 移除并删除文件
chezmoi remove ~/.bashrc
```

### 比较本地和源文件
```bash
# 查看差异
chezmoi diff

# 合并差异
chezmoi merge ~/.bashrc
```

## 参考资源

- [官方文档](https://www.chezmoi.io/)
- [GitHub 仓库](https://github.com/twpayne/chezmoi)
- [用户指南](https://www.chezmoi.io/user-guide/command-overview/)
