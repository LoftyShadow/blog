# uv - 极速 Python 包管理器

uv 是由 Astral（Ruff 开发者）开发的现代化 Python 包管理器，旨在替代 pip、pip-tools、virtualenv 等工具。

## 特性

- **极速**：用 Rust 编写，比 pip 快 10-100 倍
- **兼容**：完全兼容 PyPI，支持标准的 requirements.txt
- **一体化**：项目管理、依赖安装、虚拟环境管理全搞定
- **可靠**：确定性依赖解析，支持锁文件

## 安装 uv

### Linux / macOS
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Windows (PowerShell)
```powershell
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### 使用 pip
```bash
pip install uv
```

### 使用 Homebrew
```bash
brew install uv
```

## 常用命令

### 项目管理

| 命令 | 说明 |
|------|------|
| `uv init` | 初始化新项目 |
| `uv init myproject` | 在指定目录创建项目 |
| `uv add requests` | 添加依赖 |
| `uv remove requests` | 移除依赖 |
| `uv sync` | 同步依赖（根据 pyproject.toml） |
| `uv lock` | 生成/更新锁文件 |

### 虚拟环境

| 命令 | 说明 |
|------|------|
| `uv venv` | 创建虚拟环境（默认 .venv） |
| `uv venv .venv` | 指定虚拟环境路径 |
| `uv venv --python 3.12` | 指定 Python 版本 |
| `source .venv/bin/activate` | 激活虚拟环境（Linux/macOS） |
| `.venv\Scripts\activate` | 激活虚拟环境（Windows） |

### 包管理

| 命令 | 说明 |
|------|------|
| `uv pip install requests` | 安装包（兼容 pip 命令） |
| `uv pip install -r requirements.txt` | 从 requirements.txt 安装 |
| `uv pip list` | 列出已安装的包 |
| `uv pip uninstall requests` | 卸载包 |
| `uv pip freeze` | 导出依赖列表 |

### Python 管理

| 命令 | 说明 |
|------|------|
| `uv python install 3.12` | 安装指定 Python 版本 |
| `uv python list` | 列出已安装的 Python 版本 |
| `uv python find 3.12` | 查找系统中的 Python |
| `uv run python script.py` | 使用 uv 运行脚本 |

## 典型工作流

### 1. 创建新项目
```bash
# 创建项目
uv init myproject
cd myproject

# 添加依赖
uv add requests pytest

# 运行脚本
uv run python main.py
```

### 2. 从现有项目迁移
```bash
# 进入项目目录
cd existing-project

# 转换 requirements.txt
uv add -r requirements.txt

# 同步依赖
uv sync
```

### 3. 开发依赖管理
```bash
# 添加开发依赖
uv add --dev pytest black ruff

# 添加可选依赖组
uv add --optional docs sphinx
```

## pyproject.toml 示例

```toml
[project]
name = "myproject"
version = "0.1.0"
description = "My project description"
requires-python = ">=3.8"
dependencies = [
    "requests>=2.31.0",
    "pydantic>=2.0.0",
]

[project.optional-dependencies]
dev = ["pytest>=7.0.0", "black>=23.0.0"]
docs = ["sphinx>=7.0.0"]

[tool.uv]
dev-dependencies = [
    "pytest>=7.0.0",
    "black>=23.0.0",
]
```

## 环境变量

| 变量 | 说明 |
|------|------|
| `UV_PYTHON_INSTALL_DIR` | Python 安装目录 |
| `UV_CACHE_DIR` | 缓存目录 |
| `UV_INDEX_URL` | 自定义 PyPI 镜像 |
| `UV_EXTRA_INDEX_URL` | 额外的包索引 URL |

### 使用国内镜像
```bash
# 临时使用
uv add requests --index-url https://pypi.tuna.tsinghua.edu.cn/simple

# 永久配置（环境变量）
export UV_INDEX_URL=https://pypi.tuna.tsinghua.edu.cn/simple
```

## 性能对比

| 操作 | pip | uv |
|------|-----|-----|
| 安装 Django | 8s | 0.8s |
| 安装 pandas | 15s | 1.2s |
| 安装 100 个包 | 60s | 5s |

## 常见问题

### Q: uv 和 pip 兼容吗？
A: 完全兼容。uv 支持 requirements.txt、setup.py 和所有 PyPI 包。

### Q: 如何替换 pip？
A: 设置别名 `alias pip=uv pip`，或直接使用 `uv pip` 命令。

### Q: uv 支持 Poetry 吗？
A: 支持。可以直接在 Poetry 项目中使用 `uv sync`。

### Q: 如何指定 Python 版本？
A: 在 pyproject.toml 中设置 `requires-python = ">=3.10"`，或使用 `--python` 参数。

## 官方资源

- GitHub: https://github.com/astral-sh/uv
- 文档: https://docs.astral.sh/uv/
- 安装: https://docs.astral.sh/uv/getting-started/installation/
