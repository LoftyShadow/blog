# 生成SSH密钥
```shell
ssh-keygen -t rsa -b 4096 -C "1094290505@qq.com"
```
ssh-keygen -t rsa -b 4096 -C "email":

-t rsa: 指定算法为 RSA。

-b 4096: 指定位数。如果不加这个参数，默认通常是 2048（现在认为 2048 已经快不够安全了）。

更推荐 ed25519
```shell
ssh-keygen -t ed25519 -C "1094290505@qq.com"
```

打开~/.ssh/id_rsa.pub这个文件 复制内容
```shell
cat ~/.ssh/.id_rsa.pub
```
# 添加公钥到Github
![](img/Github使用ssh连接/2024-03-14-19-17-29.png)
输入命令
```shell
ssh -T git@github.com
```
如果是第一次的会提示是否continue，输入yes就会看到：You've successfully authenticated, but GitHub does not provide shell access 。这就表示已成功连上github。  
设置Git提交name 和 email
```shell
git config user.name "niemingzhi"
git config user.email "1094290505@qq.com"
```

# 复制公钥到远程服务器

如果是连接远程服务器（非 GitHub），可以用 `ssh-copy-id` 自动复制公钥：

```shell
# 默认复制 ~/.ssh/id_rsa.pub 或 ~/.ssh/id_ed25519.pub
ssh-copy-id user@remote-server

# 指定特定公钥文件
ssh-copy-id -i ~/.ssh/my_key.pub user@remote-server
```

执行后输入一次密码，之后就可以免密登录了。

# SSH Config 配置

编辑 `~/.ssh/config` 文件，可以简化 SSH 连接：

```shell
# GitHub
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519

# 自定义别名连接服务器
Host myserver
    HostName 192.168.1.100
    User root
    Port 22
    IdentityFile ~/.ssh/id_ed25519

# 多个 GitHub 账号场景
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
```

配置后可以直接使用别名连接：

```shell
# 连接服务器
ssh myserver

# 克隆仓库（多账号场景）
git clone git@github-work:company/repo.git
```

# 保持连接（心跳配置）

防止 SSH 连接因空闲而断开，在 `~/.ssh/config` 中添加：

```shell
# 全局配置（对所有主机生效）
Host *
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

- `ServerAliveInterval 60`：每 60 秒发送一次心跳包
- `ServerAliveCountMax 3`：连续 3 次无响应才断开连接

也可以针对特定主机配置：

```shell
Host myserver
    HostName 192.168.1.100
    User root
    ServerAliveInterval 30
    ServerAliveCountMax 5
```
