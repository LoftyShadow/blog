# Scoop 使用指南

## 简介

Scoop 是 Windows 平台上的命令行软件包管理器，类似于 Linux 的 apt、yum 或 macOS 的 Homebrew。它可以帮助你快速安装、更新和管理各种开发工具和应用程序。

## 安装 Scoop

### 前置要求

- Windows 7 SP1+ / Windows Server 2008+
- PowerShell 5.1 或更高版本
- .NET Framework 4.5 或更高版本

### 安装步骤

1. 以管理员身份打开 PowerShell

2. 设置执行策略（如果需要）：

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

3. 安装 Scoop：

```powershell
irm get.scoop.sh | iex
```

或者使用国内镜像加速：

```powershell
irm get.scoop.sh -outfile 'install.ps1'
.\install.ps1 -ScoopDir 'C:\Scoop' -ScoopGlobalDir 'C:\GlobalScoopApps' -NoProxy
```

### 自定义安装路径

```powershell
# 设置 Scoop 安装目录
$env:SCOOP='C:\Scoop'
[Environment]::SetEnvironmentVariable('SCOOP', $env:SCOOP, 'User')

# 设置全局应用安装目录
$env:SCOOP_GLOBAL='C:\GlobalScoopApps'
[Environment]::SetEnvironmentVariable('SCOOP_GLOBAL', $env:SCOOP_GLOBAL, 'Machine')
```

## 基础命令

### 搜索软件

```powershell
# 搜索软件包
scoop search <软件名>

# 示例
scoop search git
scoop search nodejs
```

### 安装软件

```powershell
# 安装软件
scoop install <软件名>

# 安装多个软件
scoop install git nodejs python

# 全局安装（需要管理员权限）
scoop install -g <软件名>
```

### 卸载软件

```powershell
# 卸载软件
scoop uninstall <软件名>

# 卸载并删除配置文件
scoop uninstall <软件名> -p

# 卸载全局软件
scoop uninstall -g <软件名>
```

### 更新软件

```powershell
# 更新 Scoop 自身
scoop update

# 更新所有已安装的软件
scoop update *

# 更新指定软件
scoop update <软件名>

# 查看哪些软件可以更新
scoop status
```

### 查看已安装软件

```powershell
# 列出已安装的软件
scoop list

# 查看软件详细信息
scoop info <软件名>

# 查看软件主页
scoop home <软件名>
```

### 清理缓存

```powershell
# 清理指定软件的旧版本
scoop cleanup <软件名>

# 清理所有软件的旧版本
scoop cleanup *

# 清理下载缓存
scoop cache rm *
```

## Bucket（软件源）管理

Scoop 通过 Bucket 来组织和管理软件包。默认只有 `main` bucket，需要手动添加其他 bucket。

### 常用 Bucket

```powershell
# 添加 extras bucket（包含更多常用软件）
scoop bucket add extras

# 添加 versions bucket（包含软件的不同版本）
scoop bucket add versions

# 添加 nerd-fonts bucket（字体）
scoop bucket add nerd-fonts

# 添加 java bucket（Java 相关）
scoop bucket add java

# 添加 nonportable bucket（需要安装的软件）
scoop bucket add nonportable
```

### Bucket 管理命令

```powershell
# 列出已添加的 bucket
scoop bucket list

# 列出所有已知的 bucket
scoop bucket known

# 删除 bucket
scoop bucket rm <bucket名>
```

## 常用软件安装

### 开发工具

```powershell
# Git
scoop install git

# Node.js
scoop install nodejs

# Python
scoop install python

# Java
scoop bucket add java
scoop install openjdk

# Go
scoop install go

# Rust
scoop install rust

# Maven
scoop install maven

# Gradle
scoop install gradle
```

### 终端工具

```powershell
# Windows Terminal
scoop install windows-terminal

# WezTerm
scoop install wezterm

# Alacritty
scoop install alacritty

# Starship（命令行提示符）
scoop install starship

# Nushell
scoop install nu

# PowerShell Core
scoop install pwsh
```

### 编辑器和 IDE

```powershell
# Neovim
scoop install neovim

# VS Code
scoop bucket add extras
scoop install vscode

# Sublime Text
scoop install sublime-text
```

### 实用工具

```powershell
# 7-Zip
scoop install 7zip

# curl
scoop install curl

# wget
scoop install wget

# jq（JSON 处理）
scoop install jq

# ripgrep（快速搜索）
scoop install ripgrep

# fd（快速查找文件）
scoop install fd

# bat（cat 的替代品）
scoop install bat

# fzf（模糊查找）
scoop install fzf

# yazi（文件管理器）
scoop install yazi

# lazygit
scoop install lazygit
```

### 字体安装

```powershell
# 添加 nerd-fonts bucket
scoop bucket add nerd-fonts

# 安装 JetBrainsMono Nerd Font
scoop install JetBrainsMono-NF

# 安装 FiraCode Nerd Font
scoop install FiraCode-NF

# 安装 Cascadia Code
scoop install CascadiaCode-NF
```

## 高级用法

### 使用代理

```powershell
# 设置代理
scoop config proxy 127.0.0.1:7890

# 取消代理
scoop config rm proxy
```

### 使用国内镜像

```powershell
# 使用 Gitee 镜像
scoop config SCOOP_REPO https://gitee.com/scoop-installer/scoop

# 使用清华镜像
scoop bucket add extras https://mirrors.tuna.tsinghua.edu.cn/git/scoop-extras.git
```

### 导出和导入软件列表

```powershell
# 导出已安装软件列表
scoop export > scoop-apps.txt

# 从列表安装软件
Get-Content scoop-apps.txt | ForEach-Object { scoop install $_ }
```

### 创建软件快捷方式

```powershell
# 为已安装的软件创建快捷方式
scoop reset <软件名>

# 为所有软件创建快捷方式
scoop reset *
```

### 持久化数据

Scoop 会自动将软件的配置文件保存在 `persist` 目录中，更新软件时不会丢失配置。

```powershell
# 查看持久化目录
ls ~\scoop\persist\<软件名>
```

## 常见问题

### 1. 安装失败：无法下载

**解决方案**：
- 检查网络连接
- 使用代理：`scoop config proxy 127.0.0.1:7890`
- 使用国内镜像

### 2. 权限不足

**解决方案**：
- 以管理员身份运行 PowerShell
- 或使用用户级安装（不加 `-g` 参数）

### 3. 软件版本冲突

**解决方案**：
```powershell
# 切换到指定版本
scoop reset <软件名>@<版本号>

# 或使用 versions bucket
scoop bucket add versions
scoop install <软件名旧版本>
```

### 4. 清理磁盘空间

```powershell
# 清理所有旧版本
scoop cleanup *

# 清理下载缓存
scoop cache rm *
```

## 推荐配置

### 一键安装开发环境

```powershell
# 添加必要的 bucket
scoop bucket add extras
scoop bucket add nerd-fonts
scoop bucket add java

# 安装开发工具
scoop install git nodejs python openjdk maven gradle

# 安装终端工具
scoop install wezterm starship nu yazi neovim lazygit

# 安装实用工具
scoop install 7zip curl wget jq ripgrep fd bat fzf

# 安装字体
scoop install JetBrainsMono-NF
```

## 参考资料

- [Scoop 官方网站](https://scoop.sh/)
- [Scoop GitHub 仓库](https://github.com/ScoopInstaller/Scoop)
- [Scoop 官方文档](https://github.com/ScoopInstaller/Scoop/wiki)
- [Scoop Bucket 列表](https://github.com/rasa/scoop-directory)

## 总结

Scoop 是 Windows 平台上非常优秀的包管理器，具有以下优点：

- ✅ 无需管理员权限（用户级安装）
- ✅ 自动管理环境变量
- ✅ 支持软件版本切换
- ✅ 配置文件持久化
- ✅ 命令行操作，适合开发者
- ✅ 软件更新方便快捷

推荐所有 Windows 开发者使用 Scoop 来管理开发工具和命令行软件。

::: details 个人软件流程

```bash
# 安装源
scoop bucket add versions
scoop bucket add main
scoop bucket add extras
scoop bucket add java

scoop install git openjdk21 maven nodejs24

scoop install go python uv

scoop install wezterm-nightly starship nu neovim yazi-nightly lazygit

scoop install altsnap

```

:::
