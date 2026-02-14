# Fedora系统 DNF 与 Flatpak 使用指南

## 概述

在 Fedora 中，常见的软件安装方式有两种：

- **DNF**：系统包管理器，安装的是 RPM 软件包，和系统集成度高。
- **Flatpak**：跨发行版的应用分发方式，适合安装桌面应用，依赖隔离更强。

一般建议：

- 命令行工具、开发依赖优先用 **DNF**。
- 桌面应用（如 GUI 软件）可优先考虑 **Flatpak**。

---

## DNF 常用操作

### 1. 刷新软件源元数据

```bash
sudo dnf makecache
```

### 2. 查询软件包

```bash
# 按名称搜索
sudo dnf search 关键字

# 查看包详细信息
sudo dnf info 包名
```

### 3. 安装软件

```bash
# 安装单个软件
sudo dnf install 包名

# 一次安装多个
sudo dnf install 包1 包2 包3
```

### 4. 更新软件

```bash
# 更新所有已安装包
sudo dnf upgrade --refresh

# 仅更新某个包
sudo dnf upgrade 包名
```

### 5. 卸载软件

```bash
# 卸载软件
sudo dnf remove 包名

# 自动清理不再需要的依赖
sudo dnf autoremove
```

### 6. 查看已安装包

```bash
sudo dnf list installed
```

### 7. 查看历史操作

```bash
sudo dnf history
```

### 8. 清理缓存

```bash
# 清理所有缓存
sudo dnf clean all

# 清理过期缓存并重新拉取元数据
sudo dnf makecache --refresh
```

---

## DNF 进阶

### 1. 启用 RPM Fusion（常用第三方仓库）

> 适合安装一些 Fedora 官方源中没有的软件（如部分多媒体编解码器）。

```bash
sudo dnf install \
  https://mirrors.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm \
  https://mirrors.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-$(rpm -E %fedora).noarch.rpm
```

### 2. 仅下载不安装（用于离线场景）

```bash
sudo dnf download 包名
```

---

## Flatpak 常用操作

## 1. 安装 Flatpak（若系统未预装）

```bash
sudo dnf install flatpak
```

## 2. 添加 Flathub 仓库

```bash
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
```

## 3. 搜索应用

```bash
flatpak search 关键字
```

## 4. 安装应用

```bash
# 按应用 ID 安装
flatpak install flathub 应用ID

# 示例：安装 VLC
flatpak install flathub org.videolan.VLC
```

## 5. 运行应用

```bash
flatpak run 应用ID
```

## 6. 查看已安装应用

```bash
flatpak list
```

## 7. 更新应用

```bash
flatpak update
```

## 8. 卸载应用

```bash
flatpak uninstall 应用ID
```

## 9. 清理未使用运行时

```bash
flatpak uninstall --unused
```

---

## DNF 与 Flatpak 对比

- **集成度**：DNF 更高（系统级）；Flatpak 为沙箱隔离。
- **适合场景**：DNF 适合系统工具、开发包、服务端组件；Flatpak 更适合桌面应用。
- **依赖处理**：DNF 依赖系统库；Flatpak 使用运行时，隔离性更强。
- **更新方式**：DNF 使用 `dnf upgrade`；Flatpak 使用 `flatpak update`。

---

## 推荐实践

1. **先 DNF，后 Flatpak**：能在官方仓库安装的工具优先使用 DNF。
2. **桌面应用优先 Flathub**：比如浏览器、编辑器、播放器等 GUI 应用。
3. **定期维护**：
   - `sudo dnf upgrade --refresh`
   - `flatpak update`
   - `sudo dnf autoremove && flatpak uninstall --unused`
