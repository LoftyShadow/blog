# COALESCE函数

COALESCE函数会按照参数的顺序依次判断值是否为空。如果找到一个非空值，则返回该值；如果所有参数都为空，则返回NULL

```sql
-- 给字段提供默认值
SELECT COALESCE(db.field, 'default_value')

-- 两个字段中第一个不为NULL的
SELECT COALESCE(db.field1, db.field2)

-- UPDATE语句中使用COALESCE函数来更新表中的列。例如，我们有一个表格存储了用户的姓名和电话号码，其中电话号码可能为空。我们希望在更新电话号码时，只使用非空的新值。以下是一个示例：
UPDATE users
SET phone = COALESCE(new_phone, phone)
WHERE id = 1;

-- 在以上示例中，COALESCE函数会检查new_phone的值是否为空。如果new_phone不为空，则使用new_phone的值来更新phone列；如果new_phone为空，则保持phone列的原值不变。
```

可以配合NULLIF同时处理NULL和空字符串信息
> `NULLIF`用来返回两个表达式的比较结果。具体来说，如果两个表达式相等，`NULLIF`函数返回NULL；如果不相等，它就返回第一个表达式的值。

```sql
SELECT COALESCE(NULLIF(field, ''), '字段为空或NULL')
FROM table
```

# LOCATE/POSITION/INSTR

## POSITION()函数

语法: POSITION(substr IN str)
返回字符串str中第一次出现子字符串substr的位置

```sql
SELECT POSITION('a' IN 'nanana'); # 2

SELECT *
FROM table
WHERE POSITION('a' IN field);
```

## LOCATE()函数

语法: LOCATE(substr,str,[pos])  
回从位置pos开始的字符串str中第一次出现子字符串substr的位置。 如果substr不在str中，则返回0。
如果substr或str为NULL，则返回NULL。  
POSITION（substr IN str）是LOCATE（substr，str）的同义词。

```sql
SELECT LOCATE('a', 'nanana'); # 2
SELECT LOCATE('a', 'nanana', 3); # 4
SELECT LOCATE('b', 'nanana'); # 0
SELECT LOCATE(10, 'nanana'); # 0
SELECT LOCATE(NULL, 'nanana'); # null
SELECT LOCATE('a', NULL); # null

SELECT *
FROM table
WHERE LOCATE('a', field);
```

## INSTR()函数

返回字符串str中第一次出现子字符串substr的位置。
INSTR()与LOCATE（）的双参数形式相同，只是参数的顺序相反。

```sql
SELECT INSTR('nanana', 'a'); # 2
SELECT INSTR('nanana', 'e'); # 0

SELECT *
FROM table
WHERE INSTR('a', field);
```

# FIND_IN_SET

FIND_IN_SET 是基于逗号分隔的完整项来匹配的

FIND_IN_SET 的第一个参数是你要查找的值，第二个参数是目标字段

如果你的数据存储结构是这种以逗号分隔的字符串列表，这种查询方法非常方便。但如果数据结构是更复杂的类型（比如 JSON
或数组），可能需要更复杂的处理。

```sql
-- 字段保存的是Set
SELECT *
FROM book
WHERE FIND_IN_SET('悬疑', book_tag);

-- 字段保存的是Set中的单个数据
SELECT *
FROM book
WHERE FIND_IN_SET(author, '施耐庵,罗贯中');
```

# 3. MEMBER OF

`MEMBER OF()` 函数检查一个指定的值是否是一个 JSON 数组中的元素。
语法：

```sql
value MEMBER OF(value, json_array)
```

参数说明：

- `value`: 必需的。一个值。可以是任意类型
- `json_array`: 必需的。一个JSON数组

返回值：

- 1： json_array中包含value，或json_array为值且与value相等
- 0： 数组中不包含value

报错情况：`json_array`不是有效的JSON文档

示例：

```sql
SELECT 1 MEMBER OF('[1,2,"a"]'), -- 1
       'a' MEMBER OF('"a"'),     -- 1
       CAST('true' AS JSON) MEMBER OF('true') -- 1
```

# CAST

语法：

```sql
CAST(expression AS type)
```

参数说明：

- `expression`: 要转换的原始表达式
- `tye`: 目标类型

常用类型和格式：

`BINARY`：二进制格式。  
`CHAR`：字符串格式。  
`DATE`：日期格式。  
`TIME`：时间格式。  
`DATETIME`：日期时间格式。  
`SIGNED`：有符号整数。  
`UNSIGNED`：无符号整数。  
`FLOAT`：浮点数。  
`DOUBLE`：双精度浮点数。  
`DECIMAL`：小数。

# ORDER BY FIELD
