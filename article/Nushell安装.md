# Nushell安装
## 1. 安装NuShell
[NuShell](https://github.com/nushell/nushell/releases)

## 2. 配置Nushell
### 2.1 通过命令配置
`nu` 进入Nushell后输入  
`$env.config.buffer_editor = "nvim"`  
输入`config nu`进行配置

### 2.2 直接修改配置文件配置
`cd $nu.default-config-dir`
可配置直接通过source xxx命令在目录中的script文件夹中
```shell
mkdir script
cd script
nvim ngr
```
```text
cd c:/SoftWare/Nginx
./nginx.exe -s reload
```
自定义在script中的脚本可以直接通过`source xxx`执行（如果直接定义自定义command也可以，不过我需要在neovim中调用该命令）

::: details 个人配置

```text
# config.nu
#
# Installed by:
# version = "0.102.0"
#
# This file is used to override default Nushell settings, define
# (or import) custom commands, or run any other startup tasks.
# See https://www.nushell.sh/book/configuration.html
#
# This file is loaded after env.nu and before login.nu
#
# You can open this file in your default editor using:
# config nu
#
# See `help config nu` for more options
#
# You can remove these comments if you want or leave
# them for future reference.

$env.STARSHIP_SHELL = "nu"

def create_left_prompt [] {
    starship prompt --cmd-duration $env.CMD_DURATION_MS $'--status=($env.LAST_EXIT_CODE)'
}

# Use nushell functions to define your right and left prompt
$env.PROMPT_COMMAND = { || create_left_prompt }
$env.PROMPT_COMMAND_RIGHT = ""

# The prompt indicators are environmental variables that represent
# the state of the prompt
$env.PROMPT_INDICATOR = ""
$env.PROMPT_INDICATOR_VI_INSERT = ": "
$env.PROMPT_INDICATOR_VI_NORMAL = "〉"
$env.PROMPT_MULTILINE_INDICATOR = "::: "

# 用nvim配置Nushell
$env.config.buffer_editor = "nvim"

# 关闭初始banner
$env.config.show_banner = false

# 集成wezterm会有换行问题，需要关闭
$env.config.shell_integration.osc133 = false

# 通过vi模式使用
$env.config.edit_mode = 'vi'

def n [file] {
  nvim $file
}

def nn [] {
  cd ~/AppData/Local/nvim
  n ./
}

def ngr [] {
  cd c:/SoftWare/Nginx
  nginx.exe -s reload
}

def ngc [] {
  cd c:/SoftWare/Nginx/conf/conf.d
  n xw.conf
}

def nr [module] {
    # 配置文件路径
    const CONFIG_PATH = 'c:/SoftWare/nginx-1.25.5/conf/conf.d/test.conf'
    # nginx路径
    const NGINX_PATH = 'c:/SoftWare/nginx-1.25.5'
    # 不需要前缀的模块
    const NO_PREFIX_LIST = [print job infra]
    # 默认前缀
    const PREFIX = 'biz-'
    
    let biz_module = if ($module in $NO_PREFIX_LIST) {
      $module
    } else {
      $PREFIX ++ $module
    }

    # 通过 reduce 维护状态（change_flag + 已处理行集合）
    let processed = open $CONFIG_PATH | lines | reduce -f {change_flag: false, lines: []} { |line, state|
        let line = $line

        # 更新标志位
        let new_flag = if $line =~ $biz_module {
            true
        } else if $state.change_flag and ($line =~ '}') {
            false
        } else {
            $state.change_flag
        }

        # 根据标志位处理当前行
        let processed_line = if $state.change_flag {
            if $line =~ '# proxy_pass' {
                $line | str replace '# proxy_pass' 'proxy_pass'
            } else if $line =~ 'proxy_pass' {
                $line | str replace 'proxy_pass' '# proxy_pass'
            } else {
                $line
            }
        } else {
            $line
        }

        # 返回新状态（更新后的标志位 + 累积处理行）
        {
            change_flag: $new_flag
            lines: ($state.lines | append $processed_line)
        }
    }

    # 保存修改
    $processed.lines | str join (char nl) | save -f $CONFIG_PATH

    # 刷新nginx
    cd $NGINX_PATH
    nginx.exe -s reload
}
```

:::
