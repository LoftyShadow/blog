# Wine 兼容 Windows 应用指南

## 简介

Wine（Wine Is Not an Emulator）是一个在 Linux 和其他类 Unix 操作系统上运行 Windows 应用程序的兼容层。它不是虚拟机或模拟器，而是将 Windows API 调用转换为 POSIX 调用，从而实现原生性能运行 Windows 程序。

## 安装 Wine

### Ubuntu/Debian 系统

```bash
# 启用 32 位架构支持（如果是 64 位系统）
sudo dpkg --add-architecture i386

# 添加 WineHQ 仓库密钥
sudo mkdir -pm755 /etc/apt/keyrings
sudo wget -O /etc/apt/keyrings/winehq-archive.key https://dl.winehq.org/wine-builds/winehq.key

# 添加 WineHQ 仓库（Ubuntu 22.04 示例）
sudo wget -NP /etc/apt/sources.list.d/ https://dl.winehq.org/wine-builds/ubuntu/dists/jammy/winehq-jammy.sources

# 更新包列表
sudo apt update

# 安装稳定版 Wine
sudo apt install --install-recommends winehq-stable
```

### Fedora 系统

```bash
# 添加 WineHQ 仓库
sudo dnf config-manager --add-repo https://dl.winehq.org/wine-builds/fedora/$(rpm -E %fedora)/winehq.repo

# 安装 Wine
sudo dnf install winehq-stable
```

### Arch Linux 系统

```bash
# 启用 multilib 仓库（编辑 /etc/pacman.conf，取消注释 [multilib] 部分）
sudo pacman -Syu wine
```

## 验证安装

```bash
# 查看 Wine 版本
wine --version

# 初始化 Wine 配置
winecfg
```

首次运行 `winecfg` 会创建 Wine 前缀（默认在 `~/.wine`）并安装必要的组件。

## 基本使用

### 运行 Windows 程序

```bash
# 运行 .exe 文件
wine /path/to/program.exe

# 或者直接双击 .exe 文件（如果文件管理器已配置）
```

### 运行 Windows 安装程序

```bash
# 运行安装程序
wine setup.exe

# 安装后的程序通常位于
# ~/.wine/drive_c/Program Files/
```

### 运行已安装的程序

```bash
# 进入程序目录运行
cd ~/.wine/drive_c/Program\ Files/YourProgram/
wine program.exe
```

## Wine 配置工具

### winecfg - Wine 配置

```bash
winecfg
```

配置选项包括：
- **应用程序**：为特定程序设置 Windows 版本
- **库**：配置 DLL 覆盖
- **显卡**：设置屏幕分辨率和 DPI
- **桌面集成**：配置文件夹映射
- **驱动器**：管理驱动器映射
- **音频**：配置音频驱动

### winetricks - 安装组件和库

Winetricks 是一个辅助脚本，用于安装常用的 Windows 组件、字体和库。

```bash
# 安装 winetricks
sudo apt install winetricks  # Ubuntu/Debian
sudo dnf install winetricks  # Fedora

# 启动图形界面
winetricks
```

常用组件安装：

```bash
# 安装 .NET Framework 4.8
winetricks dotnet48

# 安装 Visual C++ 运行库
winetricks vcrun2019

# 安装常用字体
winetricks corefonts

# 安装 DirectX 9
winetricks d3dx9
```

## Wine 前缀管理

Wine 前缀是独立的 Windows 环境，类似于容器。每个前缀都有自己的注册表、系统文件和安装的程序。

### 创建新的 Wine 前缀

```bash
# 创建 32 位前缀
WINEPREFIX=~/.wine-app32 WINEARCH=win32 winecfg

# 创建 64 位前缀
WINEPREFIX=~/.wine-app64 WINEARCH=win64 winecfg
```

### 使用特定前缀运行程序

```bash
# 在指定前缀中运行程序
WINEPREFIX=~/.wine-app32 wine program.exe

# 为特定前缀安装组件
WINEPREFIX=~/.wine-app32 winetricks vcrun2019
```

### 删除 Wine 前缀

```bash
# 删除整个前缀目录
rm -rf ~/.wine-app32
```

## 常见问题解决

### 中文乱码问题

```bash
# 安装中文字体
winetricks cjkfonts

# 或手动复制 Windows 字体到 Wine
cp /path/to/windows/fonts/*.ttf ~/.wine/drive_c/windows/Fonts/
```

### 程序无法启动或崩溃

```bash
# 在终端中运行查看错误信息
wine program.exe

# 查看详细调试信息
WINEDEBUG=+all wine program.exe 2>&1 | less

# 尝试使用虚拟桌面模式
wine explorer /desktop=MyApp,1024x768 program.exe
```

### 缺少 DLL 文件

```bash
# 使用 winetricks 安装缺失的库
winetricks vcrun2019 vcrun2015 vcrun2013

# 或者下载 DLL 文件放到以下目录
# ~/.wine/drive_c/windows/system32/  (64位)
# ~/.wine/drive_c/windows/syswow64/  (32位)
```

### 高分屏显示模糊

```bash
# 在 winecfg 中设置 DPI
winecfg
# 进入"显卡"选项卡，设置屏幕分辨率为 192 DPI 或更高
```

## 实用技巧

### 创建桌面快捷方式

创建 `.desktop` 文件来快速启动 Wine 程序：

```bash
# 创建桌面文件
nano ~/.local/share/applications/myapp.desktop
```

添加以下内容：

```ini
[Desktop Entry]
Name=My Windows App
Exec=env WINEPREFIX="/home/username/.wine" wine "C:\\Program Files\\MyApp\\app.exe"
Type=Application
Icon=wine
Categories=Wine;
```

### 性能优化

```bash
# 禁用不必要的调试输出
export WINEDEBUG=-all

# 使用 DXVK 提升 DirectX 性能（需要 Vulkan 支持）
winetricks dxvk
```

### 文件关联

让 Linux 系统自动使用 Wine 打开 .exe 文件：

```bash
# 设置默认应用程序
xdg-mime default wine.desktop application/x-ms-dos-executable
```

## Wine 替代方案

### Proton（Steam Play）

如果你主要运行游戏，Steam 的 Proton 是更好的选择：

- 基于 Wine 和 DXVK
- 针对游戏优化
- 在 Steam 设置中启用 "Steam Play" 即可

### Bottles

Bottles 是一个现代化的 Wine 前缀管理器，提供图形界面：

```bash
# Flatpak 安装
flatpak install flathub com.usebottles.bottles
```

### CrossOver

CrossOver 是 Wine 的商业版本，提供技术支持和更好的兼容性：

- 官方网站：https://www.codeweavers.com/crossover
- 付费软件，但支持 Wine 项目开发

## 兼容性查询

在安装程序前，可以查询 Wine 应用数据库了解兼容性：

- **WineHQ AppDB**：https://appdb.winehq.org/
- 查看其他用户的测试报告和配置建议
- 评级从 Platinum（完美运行）到 Garbage（无法运行）

## 常用命令速查

```bash
# 运行程序
wine program.exe

# 配置 Wine
winecfg

# 安装组件
winetricks

# 使用特定前缀
WINEPREFIX=~/.wine-app wine program.exe

# 卸载程序
wine uninstaller

# 查看 Wine 版本
wine --version

# 重新生成 Wine 前缀
wineboot -u
```

## 总结

Wine 是在 Linux 上运行 Windows 应用的强大工具，虽然不是所有程序都能完美运行，但对于大多数常用软件来说已经足够。通过合理配置和使用 winetricks，可以解决大部分兼容性问题。

**建议**：
- 优先使用原生 Linux 应用
- 运行前查询 WineHQ AppDB 了解兼容性
- 为不同应用创建独立的 Wine 前缀
- 遇到问题时查看终端输出的错误信息

**参考资源**：
- 官方网站：https://www.winehq.org/
- 官方文档：https://wiki.winehq.org/
- 应用数据库：https://appdb.winehq.org/
- Winetricks：https://github.com/Winetricks/winetricks
