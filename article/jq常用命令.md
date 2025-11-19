# jq常用命令整理
[jq官方手册](https://jqlang.org/manual)

只取数组的前两位
```bash
jq -r '.data.list[0:2]' my.json
```

遍历数组的每个元素
```bash
jq -r '.data.list[]' my.json
```
遍历后收集成成数组
```bash
jq -r '[.data.list[]]' my.json
```

字符串插值
```bash
jq -r '"\(.itemCount)"' my.json
```

遍历数组时的插值处理
```bash
jq -r '.data.list[] | "\(.serviceType) \(.serviceTypeName)"' my.json
```

数组去重
```bash
jq -r '.data.list | unique_by(.serviceType) | .[] | "\(.serviceType)+\(.serviceTypeName)"' my.json
```

筛选以执行内容开头的数据（map(f) 的作用是：对数组中的每一个元素，应用函数 f，然后返回一个）

```bash
jq 'map(select(.address | startswith("http://")))' my.json
```

## jq的select使用

### 基础：数值比较

年龄大于 30
map(select(.age > 30))

价格等于 100
map(select(.price == 100))

数量不为 null 且大于 0
map(select(.quantity > 0))

### 字符串匹配

字段等于某个值
map(select(.status == "active"))

包含某个子串
map(select(.name | contains("John")))

以某字符串开头（你刚学的）
map(select(.url | startswith("https://")))

以某字符串结尾
map(select(.file | endswith(".json")))

### 字段是否存在

检查字段是否存在
map(select(has("email")))

字段不存在
map(select(has("phone") | not))

多个字段都存在
map(select(has("name") and has("age")))

### 类型判断

确保 .value 是数字
map(select(.value | type == "number"))

是字符串
map(select(.name | type == "string"))

是数组
map(select(.tags | type == "array"))

### 正则表达式匹配（test）

匹配邮箱格式
map(select(.email | test("^[^@]+@[^@]+\\.[^@]+$")))

IP 地址匹配
map(select(.ip | test("^192\\.168\\.")))

忽略大小写匹配
map(select(.name | test("admin"; "i")))  # "i" 表示忽略大小写

### 嵌套对象过滤

.users | map(select(.profile.active == true))

### 多条件组合（and / or / not）

年龄大于 18 且状态为 active
map(select(.age > 18 and .status == "active"))

是管理员 或 超级用户
map(select(.role == "admin" or .role == "superuser"))

不是测试用户
map(select(.username | startswith("test") | not))

### 空值/非空值判断

字段不为 null
map(select(.email != null))

简写：非空（注意：空字符串、0 也会被过滤）
map(select(.name)) # 只保留 .name 为 true-like 的（非 null、非 false）

更安全：只排除 null
map(select(.name // false | .))
|  场景   |                  示例                  |
|:-----:|:------------------------------------:|
| 数值比较  |              .age > 30               |
| 字符串匹配 | .name == "xxx", contains, startswith |
| 字段存在性 |             has("field")             |
| 类型检查  |           type == "string"           |
| 正则匹配  |           test("pattern")            |
| 数组包含  |     index("x"), contains(["x"])      |
| 嵌套字段  |             .a.b.c == 1              |
|  多条件  |             and, or, not             |
| 非空判断  |            .field != null            |
