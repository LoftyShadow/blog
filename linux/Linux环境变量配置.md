# Linux环境变量配置

## 在`/etc/profile.d`目录下创建sh脚本
```bash
cd /etc/profile.d
vi my_env.sh
```

```bash
export JAVA_HOME="/usr/java/jdk1.8.0_202"

export PATH=$PATH:$JAVA_HOME/bin
```

## 给脚本增加执行权限
```bash
chmod +x my_env.sh
```

## 将命令行工具放到全局可用的位置

对于下载的二进制工具（如 `lazydocker`、`ripgrep` 等），放到 `$PATH` 包含的目录即可全局调用。

### 推荐目录

| 目录 | 说明 |
|------|------|
| `/usr/local/bin/` | 用户手动安装的程序，推荐使用 |
| `~/.local/bin/` | 仅当前用户可用，无需 sudo |

### 操作方式

```bash
# 方式一：放到 /usr/local/bin（所有用户可用）
sudo mv lazydocker /usr/local/bin/
sudo chmod +x /usr/local/bin/lazydocker

# 方式二：放到 ~/.local/bin（仅当前用户可用，无需 sudo）
mkdir -p ~/.local/bin
mv lazydocker ~/.local/bin/
chmod +x ~/.local/bin/lazydocker
```

::: tip
`~/.local/bin/` 在部分发行版中默认不在 `$PATH` 里，需要手动添加：

```bash
export PATH="$HOME/.local/bin:$PATH"
```
:::

## 环境变量配置文件对比

Linux 下有多个位置可以配置环境变量，它们的作用范围和加载时机不同。

### 系统级（所有用户生效）

| 文件 | 加载时机 | 说明 |
|------|---------|------|
| `/etc/environment` | 系统启动时（PAM 加载） | 纯键值对格式，不支持变量引用，最早加载 |
| `/etc/profile` | 登录 Shell 启动时 | 所有用户的登录 Shell 都会读取 |
| `/etc/profile.d/*.sh` | 被 `/etc/profile` 调用 | 推荐方式，按文件拆分，便于管理 |
| `/etc/bash.bashrc` | Bash 非登录交互 Shell | 仅 Bash 生效 |
| `/etc/zshrc` | Zsh 非登录交互 Shell | 仅 Zsh 生效 |

### 用户级（仅当前用户生效）

| 文件 | 加载时机 | 说明 |
|------|---------|------|
| `~/.profile` | 登录 Shell 启动时 | 通用，Bash/Zsh/Sh 都可能读取 |
| `~/.bash_profile` | Bash 登录 Shell | 存在时 Bash 会跳过 `~/.profile` |
| `~/.bashrc` | Bash 非登录交互 Shell | 每次打开新终端窗口都会加载 |
| `~/.zprofile` | Zsh 登录 Shell | 对应 Bash 的 `~/.bash_profile` |
| `~/.zshrc` | Zsh 非登录交互 Shell | 每次打开新终端窗口都会加载 |
| `~/.zshenv` | Zsh 任何场景都加载 | 最早加载，脚本和非交互也生效 |

### 登录 Shell vs 非登录 Shell

- 登录 Shell：SSH 登录、`su - user`、tty 登录
- 非登录 Shell：打开终端模拟器（如 Alacritty、GNOME Terminal）

### Zsh 加载顺序

```
~/.zshenv → /etc/zprofile → ~/.zprofile → /etc/zshrc → ~/.zshrc → ~/.zlogin
```

### Bash 加载顺序

```
/etc/profile → ~/.bash_profile（或 ~/.profile）→ ~/.bashrc
```

### 如何选择

| 需求 | 推荐配置位置 |
|------|-------------|
| 所有用户都需要的环境变量（如 JAVA_HOME） | `/etc/profile.d/xxx.sh` |
| 仅当前用户的环境变量 | `~/.zshrc`（Zsh）或 `~/.bashrc`（Bash） |
| 确保脚本和非交互场景也生效（Zsh） | `~/.zshenv` |
| 不支持变量引用的简单配置 | `/etc/environment` |

## 查看当前 PATH

```bash
echo $PATH

# 按冒号分行显示，更清晰
echo $PATH | tr ':' '\n'
```

## 修改后立即生效

修改配置文件后不用重新登录，`source` 一下即可：

```bash
source ~/.zshrc        # Zsh
source ~/.bashrc       # Bash
source /etc/profile    # 系统级
```
