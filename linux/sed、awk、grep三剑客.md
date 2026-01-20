# sed、awk、grep三剑客

Linux文本处理三剑客是指`grep`、`sed`、`awk`三个强大的文本处理工具。它们各有特点,配合使用可以完成几乎所有的文本处理任务。

## grep - 文本搜索工具

`grep`(Global Regular Expression Print)用于在文件中搜索匹配的文本行。

### 基本语法

```bash
grep [选项] 模式 [文件...]
```

### 常用选项

| 选项 | 说明 |
|------|------|
| `-i` | 忽略大小写 |
| `-v` | 反向匹配,显示不匹配的行 |
| `-n` | 显示行号 |
| `-c` | 只显示匹配的行数 |
| `-l` | 只显示匹配的文件名 |
| `-r` 或 `-R` | 递归搜索目录 |
| `-E` | 使用扩展正则表达式(相当于egrep) |
| `-A n` | 显示匹配行及其后n行 |
| `-B n` | 显示匹配行及其前n行 |
| `-C n` | 显示匹配行及其前后各n行 |
| `-w` | 匹配整个单词 |
| `-x` | 匹配整行 |
| `-o` | 只显示匹配的部分 |
| `--color` | 高亮显示匹配的文本 |

### 使用示例

```bash
# 基本搜索
grep "error" log.txt

# 忽略大小写搜索
grep -i "error" log.txt

# 显示行号
grep -n "error" log.txt

# 反向匹配
grep -v "success" log.txt

# 递归搜索目录
grep -r "TODO" ./src

# 使用正则表达式
grep -E "error|warning" log.txt

# 显示匹配行的前后3行
grep -C 3 "error" log.txt

# 统计匹配行数
grep -c "error" log.txt

# 只显示匹配的文件名
grep -l "error" *.log

# 匹配整个单词
grep -w "test" file.txt

# 只显示匹配的部分
grep -o "http://[^ ]*" file.txt
```

### 正则表达式示例

```bash
# 匹配以error开头的行
grep "^error" log.txt

# 匹配以error结尾的行
grep "error$" log.txt

# 匹配包含数字的行
grep "[0-9]" log.txt

# 匹配IP地址
grep -E "[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}" log.txt

# 匹配邮箱地址
grep -E "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}" file.txt
```

## sed - 流编辑器

`sed`(Stream Editor)是一个强大的流编辑器,用于对文本进行过滤和转换。

### 基本语法

```bash
sed [选项] '命令' [文件...]
```

### 常用选项

| 选项 | 说明 |
|------|------|
| `-n` | 静默模式,只显示处理后的行 |
| `-e` | 执行多个sed命令 |
| `-f` | 从文件中读取sed命令 |
| `-i` | 直接修改文件内容 |
| `-i.bak` | 修改文件前先备份 |
| `-r` 或 `-E` | 使用扩展正则表达式 |

### 常用命令

| 命令 | 说明 |
|------|------|
| `s/pattern/replacement/` | 替换文本 |
| `d` | 删除行 |
| `p` | 打印行 |
| `a` | 在当前行后追加文本 |
| `i` | 在当前行前插入文本 |
| `c` | 替换当前行 |
| `y` | 字符转换 |
| `q` | 退出sed |

### 使用示例

```bash
# 替换文本(只替换每行第一个匹配)
sed 's/old/new/' file.txt

# 替换文本(替换所有匹配)
sed 's/old/new/g' file.txt

# 替换文本(忽略大小写)
sed 's/old/new/gi' file.txt

# 直接修改文件
sed -i 's/old/new/g' file.txt

# 修改前备份
sed -i.bak 's/old/new/g' file.txt

# 删除空行
sed '/^$/d' file.txt

# 删除第3行
sed '3d' file.txt

# 删除第3到5行
sed '3,5d' file.txt

# 删除最后一行
sed '$d' file.txt

# 删除包含pattern的行
sed '/pattern/d' file.txt

# 只打印第3行
sed -n '3p' file.txt

# 打印第3到5行
sed -n '3,5p' file.txt

# 打印包含pattern的行
sed -n '/pattern/p' file.txt

# 在第3行后追加文本
sed '3a\new line' file.txt

# 在第3行前插入文本
sed '3i\new line' file.txt

# 替换第3行
sed '3c\new line' file.txt

# 多个命令
sed -e 's/old/new/g' -e '/pattern/d' file.txt

# 字符转换(将小写转大写)
sed 'y/abcdefghijklmnopqrstuvwxyz/ABCDEFGHIJKLMNOPQRSTUVWXYZ/' file.txt
```

### 高级示例

```bash
# 在匹配行前插入空行
sed '/pattern/i\\' file.txt

# 在匹配行后插入空行
sed '/pattern/a\\' file.txt

# 替换指定行的内容
sed '3s/old/new/' file.txt

# 从第3行到最后一行替换
sed '3,$s/old/new/g' file.txt

# 只在匹配行进行替换
sed '/pattern/s/old/new/g' file.txt

# 删除行首空格
sed 's/^[ \t]*//' file.txt

# 删除行尾空格
sed 's/[ \t]*$//' file.txt

# 删除HTML标签
sed 's/<[^>]*>//g' file.html

# 在每行前添加行号
sed = file.txt | sed 'N;s/\n/\t/'

# 反转文件内容(最后一行变第一行)
sed '1!G;h;$!d' file.txt

# 删除重复的连续行
sed '$!N; /^\(.*\)\n\1$/!P; D' file.txt
```

## awk - 文本分析工具

`awk`是一个强大的文本分析工具,特别适合处理格式化的文本数据。

### 基本语法

```bash
awk [选项] 'pattern {action}' [文件...]
```

### 内置变量

| 变量 | 说明 |
|------|------|
| `$0` | 当前整行内容 |
| `$1, $2, ...` | 第1列、第2列等 |
| `NF` | 当前行的字段数 |
| `NR` | 当前行号 |
| `FNR` | 当前文件的行号 |
| `FS` | 字段分隔符(默认空格) |
| `OFS` | 输出字段分隔符 |
| `RS` | 记录分隔符(默认换行) |
| `ORS` | 输出记录分隔符 |
| `FILENAME` | 当前文件名 |

### 常用选项

| 选项 | 说明 |
|------|------|
| `-F` | 指定字段分隔符 |
| `-v` | 定义变量 |
| `-f` | 从文件读取awk脚本 |

### 基本使用示例

```bash
# 打印整行
awk '{print}' file.txt
awk '{print $0}' file.txt

# 打印第1列
awk '{print $1}' file.txt

# 打印第1列和第3列
awk '{print $1, $3}' file.txt

# 打印最后一列
awk '{print $NF}' file.txt

# 打印倒数第二列
awk '{print $(NF-1)}' file.txt

# 打印行号和内容
awk '{print NR, $0}' file.txt

# 指定分隔符(冒号)
awk -F: '{print $1}' /etc/passwd

# 指定多个分隔符
awk -F'[,:]' '{print $1}' file.txt

# 指定输出分隔符
awk 'BEGIN{OFS=","} {print $1, $2}' file.txt
```

### 条件和模式匹配

```bash
# 打印包含pattern的行
awk '/pattern/' file.txt

# 打印不包含pattern的行
awk '!/pattern/' file.txt

# 打印第3列等于100的行
awk '$3 == 100' file.txt

# 打印第3列大于100的行
awk '$3 > 100' file.txt

# 打印第1列匹配pattern的行
awk '$1 ~ /pattern/' file.txt

# 打印第1列不匹配pattern的行
awk '$1 !~ /pattern/' file.txt

# 多个条件(AND)
awk '$3 > 100 && $4 < 200' file.txt

# 多个条件(OR)
awk '$3 > 100 || $4 < 200' file.txt

# 打印第3到第5行
awk 'NR>=3 && NR<=5' file.txt

# 打印奇数行
awk 'NR%2==1' file.txt

# 打印偶数行
awk 'NR%2==0' file.txt
```

### BEGIN和END块

```bash
# BEGIN块在处理文件前执行
awk 'BEGIN{print "开始处理"} {print $0} END{print "处理完成"}' file.txt

# 统计文件行数
awk 'END{print NR}' file.txt

# 打印表头
awk 'BEGIN{print "姓名\t年龄\t城市"} {print $1"\t"$2"\t"$3}' file.txt

# 初始化变量
awk 'BEGIN{sum=0} {sum+=$3} END{print "总和:", sum}' file.txt
```

### 统计和计算

```bash
# 计算第3列的总和
awk '{sum+=$3} END{print sum}' file.txt

# 计算第3列的平均值
awk '{sum+=$3} END{print sum/NR}' file.txt

# 计算第3列的最大值
awk 'BEGIN{max=0} {if($3>max) max=$3} END{print max}' file.txt

# 计算第3列的最小值
awk 'NR==1{min=$3} {if($3<min) min=$3} END{print min}' file.txt

# 统计每个值出现的次数
awk '{count[$1]++} END{for(i in count) print i, count[i]}' file.txt

# 去重
awk '!seen[$0]++' file.txt
```

### 字符串函数

```bash
# 字符串长度
awk '{print length($1)}' file.txt

# 字符串截取(从第2个字符开始,截取3个)
awk '{print substr($1, 2, 3)}' file.txt

# 字符串替换
awk '{gsub(/old/, "new"); print}' file.txt

# 字符串分割
awk '{split($0, arr, ","); print arr[1]}' file.txt

# 转大写
awk '{print toupper($1)}' file.txt

# 转小写
awk '{print tolower($1)}' file.txt

# 查找子串位置
awk '{print index($1, "test")}' file.txt
```

## 三剑客组合使用

三个工具可以通过管道组合使用,发挥更强大的功能。

### 组合示例

```bash
# grep + awk: 搜索后提取字段
grep "error" log.txt | awk '{print $1, $5}'

# grep + sed: 搜索后替换
grep "error" log.txt | sed 's/error/ERROR/g'

# awk + sed: 提取字段后替换
awk '{print $1}' file.txt | sed 's/old/new/g'

# 三者组合: 搜索、提取、替换
grep "error" log.txt | awk '{print $3}' | sed 's/^/ERROR: /'

# 统计日志中错误出现次数
grep "error" log.txt | wc -l

# 提取IP地址并统计
grep -oE "[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}" access.log | sort | uniq -c | sort -rn

# 分析访问日志,统计每个IP的访问次数
awk '{print $1}' access.log | sort | uniq -c | sort -rn | head -10
```

### 实战案例

```bash
# 案例1: 分析Nginx访问日志,统计状态码分布
awk '{print $9}' access.log | sort | uniq -c | sort -rn

# 案例2: 提取所有404错误的URL
awk '$9==404 {print $7}' access.log | sort | uniq

# 案例3: 统计每小时的访问量
awk '{print substr($4, 2, 14)}' access.log | uniq -c

# 案例4: 查找占用CPU最高的进程
ps aux | grep -v USER | awk '{print $3, $11}' | sort -rn | head -5

# 案例5: 批量重命名文件
ls *.txt | awk '{print "mv "$0" "substr($0,1,length($0)-4)".bak"}' | bash

# 案例6: 提取CSV文件的特定列
awk -F',' '{print $2, $5}' data.csv

# 案例7: 删除文件中的空行和注释行
sed '/^$/d; /^#/d' config.conf

# 案例8: 统计代码行数(排除空行和注释)
grep -v "^$" *.java | grep -v "^[[:space:]]*\/\/" | wc -l
```

## 使用技巧和最佳实践

### 选择合适的工具

- **grep**: 适合简单的文本搜索和过滤
- **sed**: 适合文本替换、删除、插入等编辑操作
- **awk**: 适合处理结构化数据、统计分析、复杂的文本处理

### 性能优化

```bash
# 使用固定字符串搜索(更快)
grep -F "string" file.txt

# 限制搜索深度
grep -r --max-depth=2 "pattern" ./

# 使用二进制模式(跳过二进制文件)
grep -I "pattern" *
```

### 注意事项

1. **备份重要文件**: 使用`sed -i`修改文件前,建议先备份
   ```bash
   cp file.txt file.txt.bak
   # 或使用
   sed -i.bak 's/old/new/g' file.txt
   ```

2. **测试正则表达式**: 先在小范围测试,确认无误后再应用到大文件
   ```bash
   # 先测试不修改文件
   sed 's/old/new/g' file.txt
   # 确认无误后再修改
   sed -i 's/old/new/g' file.txt
   ```

3. **引号使用**: 单引号保护特殊字符,双引号允许变量替换
   ```bash
   # 单引号
   awk '{print $1}' file.txt
   # 双引号(使用变量)
   awk "{print \$$col}" file.txt
   ```

4. **转义字符**: 注意特殊字符需要转义
   ```bash
   # 搜索包含$的行
   grep '\$' file.txt
   # sed中替换/字符
   sed 's/\/old\/path/\/new\/path/g' file.txt
   # 或使用其他分隔符
   sed 's|/old/path|/new/path|g' file.txt
   ```

## 总结

grep、sed、awk是Linux文本处理的三大利器:

- **grep**: 快速搜索和过滤文本
- **sed**: 强大的流编辑器,适合批量文本替换和编辑
- **awk**: 功能最强大,适合处理结构化数据和复杂的文本分析

掌握这三个工具,可以高效地完成各种文本处理任务。建议从简单的命令开始练习,逐步掌握高级用法,并在实际工作中灵活组合使用。
