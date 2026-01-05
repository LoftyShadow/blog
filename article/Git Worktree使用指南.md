# Git Worktree 使用指南

## 什么是 Git Worktree

Git Worktree 是 Git 提供的一个功能，允许你在同一个仓库中同时检出多个分支到不同的工作目录。这意味着你可以在不同的目录中同时处理同一个仓库的不同分支，而无需频繁切换分支或克隆多个仓库副本。

## 核心概念

- **主工作树（Main Working Tree）**：通过 `git clone` 或 `git init` 创建的原始工作目录
- **链接工作树（Linked Working Tree）**：通过 `git worktree add` 创建的额外工作目录
- 所有工作树共享同一个 `.git` 目录（实际上是引用），因此共享所有的提交历史、分支、标签等

## 基本使用方法

### 1. 查看现有的工作树

```bash
git worktree list
```

输出示例：
```
/path/to/main-repo    abc1234 [main]
/path/to/feature-repo def5678 [feature/new-feature]
```

### 2. 创建新的工作树

#### 基于现有分支创建

```bash
# 语法：git worktree add <路径> <分支名>
git worktree add ../feature-branch feature/new-feature
```

#### 创建新分支并关联工作树

```bash
# 语法：git worktree add <路径> -b <新分支名>
git worktree add ../hotfix -b hotfix/urgent-fix
```

#### 基于特定提交创建

```bash
git worktree add ../old-version abc1234
```

### 3. 删除工作树

```bash
# 先删除工作目录（或手动删除文件夹）
rm -rf ../feature-branch

# 然后清理 worktree 记录
git worktree prune

# 或者使用 remove 命令（Git 2.17+）
git worktree remove ../feature-branch
```

### 4. 移动工作树

```bash
# Git 2.17+ 支持
git worktree move <旧路径> <新路径>
```

## Git Worktree vs 分别拉取两个项目

### 传统方式：分别克隆两个仓库

```bash
# 方式一：克隆两次
git clone https://github.com/user/repo.git repo-main
git clone https://github.com/user/repo.git repo-feature

cd repo-main
git checkout main

cd ../repo-feature
git checkout feature/new-feature
```

### Git Worktree 方式

```bash
# 只克隆一次
git clone https://github.com/user/repo.git repo

cd repo
# 创建额外的工作树
git worktree add ../repo-feature feature/new-feature
```

### 对比分析

| 对比维度 | 分别克隆两个项目 | Git Worktree |
|---------|----------------|--------------|
| **磁盘空间** | 占用 2 倍空间（两个完整的 .git 目录） | 节省空间（共享 .git 目录） |
| **克隆时间** | 需要两次完整克隆 | 只需一次克隆 + 快速创建工作树 |
| **分支同步** | 需要在两个目录分别 pull | 一次 fetch 同步所有工作树 |
| **提交可见性** | 需要在另一个目录 pull 才能看到 | 立即在所有工作树可见 |
| **分支切换** | 可以在同一目录切换分支 | 不同分支在不同目录，无需切换 |
| **并行开发** | 支持，但管理复杂 | 天然支持，管理简单 |
| **分支保护** | 无保护，可能误操作 | 同一分支不能在多个工作树同时检出 |

## 优缺点分析

### Git Worktree 的优点

1. **节省磁盘空间**
   - 多个工作树共享同一个 `.git` 目录
   - 对于大型仓库，节省效果显著

2. **提高效率**
   - 无需频繁切换分支
   - 避免切换分支时的文件重新编译
   - 快速在不同分支间对比代码

3. **并行开发**
   - 同时在多个分支上工作
   - 主分支运行服务，同时开发新功能
   - 紧急修复时无需暂存当前工作

4. **分支隔离**
   - 每个工作树独立的工作目录
   - 避免分支切换导致的文件冲突
   - IDE 配置、编译产物互不影响

5. **提交同步**
   - 一次 `git fetch` 更新所有工作树
   - 提交立即在所有工作树可见
   - 简化多分支管理

### Git Worktree 的缺点

1. **学习成本**
   - 需要理解工作树的概念
   - 命令相对陌生

2. **目录管理**
   - 需要手动管理多个工作目录
   - 删除工作树需要额外步骤

3. **IDE 支持**
   - 部分 IDE 对 worktree 支持不完善
   - 可能需要为每个工作树单独配置

4. **分支限制**
   - 同一分支不能在多个工作树同时检出
   - 需要注意分支的使用状态

## 实际使用场景

### 场景 1：并行开发多个功能

```bash
# 主分支继续开发
cd ~/project/main

# 同时开发新功能
git worktree add ~/project/feature-a feature/user-auth
git worktree add ~/project/feature-b feature/payment

# 在不同终端窗口同时工作
# 终端1: cd ~/project/main
# 终端2: cd ~/project/feature-a
# 终端3: cd ~/project/feature-b
```

### 场景 2：紧急修复 Bug

```bash
# 当前正在开发新功能，突然需要修复线上 Bug
cd ~/project/main  # 当前在 develop 分支

# 创建 hotfix 工作树
git worktree add ~/project/hotfix -b hotfix/critical-bug

# 在 hotfix 目录修复 Bug
cd ~/project/hotfix
# 修复代码...
git add .
git commit -m "fix: 修复关键 Bug"
git push origin hotfix/critical-bug

# 修复完成后，回到原来的开发工作
cd ~/project/main
# 继续开发，无需切换分支或暂存代码
```

### 场景 3：代码审查和对比

```bash
# 主分支
cd ~/project/main

# 创建待审查分支的工作树
git worktree add ~/project/review feature/to-review

# 使用 diff 工具对比
# 或在 IDE 中同时打开两个项目进行对比
```

### 场景 4：运行不同版本的服务

```bash
# 主分支运行当前版本
cd ~/project/main
npm run dev  # 端口 3000

# 新功能分支运行测试版本
git worktree add ~/project/feature feature/new-api
cd ~/project/feature
npm run dev -- --port 3001  # 端口 3001

# 同时运行两个版本进行对比测试
```

## 注意事项

### 1. 分支检出限制

同一个分支不能在多个工作树中同时检出：

```bash
# 错误示例
git worktree add ../worktree-1 main
git worktree add ../worktree-2 main  # ❌ 失败：main 已在另一个工作树中
```

**解决方案**：
- 为不同的工作树使用不同的分支
- 或者先删除已有的工作树

### 2. 删除工作树的正确方式

```bash
# ❌ 错误：直接删除目录会留下记录
rm -rf ../worktree-feature

# ✅ 正确：使用 git worktree remove
git worktree remove ../worktree-feature

# 或者先删除目录，再清理记录
rm -rf ../worktree-feature
git worktree prune
```

### 3. 共享 .git 目录的影响

所有工作树共享同一个 `.git` 目录，因此：
- 配置文件（`.git/config`）是共享的
- 钩子（hooks）是共享的
- 引用（refs）是共享的
- 一个工作树的提交立即在其他工作树可见

### 4. 工作树路径建议

```bash
# ✅ 推荐：使用相对路径或统一的目录结构
git worktree add ../project-feature feature/new
git worktree add ../project-hotfix hotfix/bug

# 或者
git worktree add ~/workspaces/project-feature feature/new
git worktree add ~/workspaces/project-hotfix hotfix/bug
```

## 常见问题

### Q1: 如何查看某个工作树关联的分支？

```bash
git worktree list
```

### Q2: 工作树可以嵌套吗？

不建议。虽然技术上可行，但会导致管理混乱。建议所有工作树都在同一层级。

### Q3: 删除分支后，关联的工作树会怎样？

工作树不会自动删除，需要手动清理：

```bash
git worktree prune
```

### Q4: 如何在工作树之间共享未提交的更改？

不能直接共享。每个工作树的工作目录是独立的。如果需要共享，可以：
- 提交更改（推荐）
- 使用 `git stash` + `git stash pop`
- 手动复制文件

### Q5: Git Worktree 支持子模块吗？

支持，但每个工作树需要独立初始化子模块：

```bash
git worktree add ../feature feature/new
cd ../feature
git submodule update --init --recursive
```

## 总结

Git Worktree 是一个强大的功能，特别适合以下场景：

- ✅ 需要同时在多个分支上工作
- ✅ 频繁在分支间切换导致效率低下
- ✅ 需要对比不同分支的代码
- ✅ 大型项目，克隆多次耗时过长
- ✅ 紧急修复 Bug 时不想暂存当前工作

相比传统的分别克隆两个项目的方式，Git Worktree 具有以下优势：

1. **节省磁盘空间**：共享 `.git` 目录
2. **提高效率**：无需频繁切换分支
3. **简化管理**：统一的提交历史和分支管理
4. **分支保护**：防止同一分支在多处同时修改

但也需要注意：

- 需要一定的学习成本
- 需要手动管理多个工作目录
- 同一分支不能在多个工作树同时检出

总的来说，Git Worktree 是提高开发效率的利器，值得在日常开发中使用。

## 参考资料

- [Git 官方文档 - git-worktree](https://git-scm.com/docs/git-worktree)
- [Pro Git Book - Git Worktree](https://git-scm.com/book/en/v2)
