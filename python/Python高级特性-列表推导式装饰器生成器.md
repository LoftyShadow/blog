# Python 高级特性：List Comprehension、Decorators、Generators

> Python 三大核心特性详解

---

## 1. List Comprehension (列表推导式)

### 1.1 基本概念

列表推导式是 Python 中一种简洁、优雅的创建列表的方式，可以用一行代码替代多行循环。

**语法格式**：
```python
[expression for item in iterable if condition]
```

### 1.2 基础示例

```python
# ❌ 传统方式
numbers = []
for i in range(10):
    numbers.append(i * 2)
# 结果: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]

# ✅ 列表推导式
numbers = [i * 2 for i in range(10)]
# 结果: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]
```

### 1.3 带条件的列表推导式

```python
# 筛选偶数
evens = [i for i in range(20) if i % 2 == 0]
# 结果: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]

# 筛选并转换
squares_of_evens = [i**2 for i in range(10) if i % 2 == 0]
# 结果: [0, 4, 16, 36, 64]
```

### 1.4 嵌套列表推导式

```python
# 二维列表展平
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flattened = [num for row in matrix for num in row]
# 结果: [1, 2, 3, 4, 5, 6, 7, 8, 9]

# 创建二维列表
matrix = [[i * j for j in range(1, 4)] for i in range(1, 4)]
# 结果: [[1, 2, 3], [2, 4, 6], [3, 6, 9]]
```

### 1.5 字典推导式和集合推导式

```python
# 字典推导式
squares_dict = {x: x**2 for x in range(6)}
# 结果: {0: 0, 1: 1, 2: 4, 3: 9, 4: 16, 5: 25}

# 集合推导式（自动去重）
unique_lengths = {len(word) for word in ['hello', 'world', 'python', 'code']}
# 结果: {4, 5, 6}
```

### 1.6 实际应用场景

```python
# 场景1: 数据清洗
data = ['  hello  ', 'WORLD', '  Python  ']
cleaned = [item.strip().lower() for item in data]
# 结果: ['hello', 'world', 'python']

# 场景2: 提取对象属性
users = [
    {'name': 'Alice', 'age': 25},
    {'name': 'Bob', 'age': 30},
    {'name': 'Charlie', 'age': 35}
]
names = [user['name'] for user in users if user['age'] >= 30]
# 结果: ['Bob', 'Charlie']

# 场景3: 文件处理
with open('data.txt') as f:
    lines = [line.strip() for line in f if line.strip()]
```

### 1.7 性能对比

```python
import timeit

# 列表推导式更快
def using_loop():
    result = []
    for i in range(1000):
        result.append(i * 2)
    return result

def using_comprehension():
    return [i * 2 for i in range(1000)]

# 列表推导式通常快 20-30%
```

---

## 2. Decorators (装饰器)

### 2.1 基本概念

装饰器是 Python 中一种强大的设计模式，用于在不修改原函数代码的情况下，为函数添加额外功能。

**本质**：装饰器是一个接受函数作为参数并返回新函数的高阶函数。

### 2.2 基础装饰器

```python
# 定义装饰器
def my_decorator(func):
    def wrapper():
        print("函数执行前")
        func()
        print("函数执行后")
    return wrapper

# 使用装饰器
@my_decorator
def say_hello():
    print("Hello!")

# 调用
say_hello()
# 输出:
# 函数执行前
# Hello!
# 函数执行后
```

### 2.3 带参数的装饰器

```python
def my_decorator(func):
    def wrapper(*args, **kwargs):
        print(f"调用函数: {func.__name__}")
        print(f"参数: args={args}, kwargs={kwargs}")
        result = func(*args, **kwargs)
        print(f"返回值: {result}")
        return result
    return wrapper

@my_decorator
def add(a, b):
    return a + b

result = add(3, 5)
# 输出:
# 调用函数: add
# 参数: args=(3, 5), kwargs={}
# 返回值: 8
```

### 2.4 保留函数元信息

```python
from functools import wraps

def my_decorator(func):
    @wraps(func)  # 保留原函数的 __name__, __doc__ 等
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@my_decorator
def greet(name):
    """问候函数"""
    return f"Hello, {name}!"

print(greet.__name__)  # 输出: greet
print(greet.__doc__)   # 输出: 问候函数
```

### 2.5 带参数的装饰器（装饰器工厂）

```python
def repeat(times):
    """装饰器工厂：重复执行函数 n 次"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            results = []
            for _ in range(times):
                result = func(*args, **kwargs)
                results.append(result)
            return results
        return wrapper
    return decorator

@repeat(times=3)
def greet(name):
    return f"Hello, {name}!"

print(greet("Alice"))
# 输出: ['Hello, Alice!', 'Hello, Alice!', 'Hello, Alice!']
```

### 2.6 常见装饰器应用场景

#### 场景1: 计时装饰器

```python
import time
from functools import wraps

def timer(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} 执行时间: {end - start:.4f}秒")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(1)
    return "完成"

slow_function()
# 输出: slow_function 执行时间: 1.0012秒
```

#### 场景2: 日志装饰器

```python
import logging
from functools import wraps

logging.basicConfig(level=logging.INFO)

def log_calls(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        logging.info(f"调用 {func.__name__} with args={args}, kwargs={kwargs}")
        try:
            result = func(*args, **kwargs)
            logging.info(f"{func.__name__} 返回: {result}")
            return result
        except Exception as e:
            logging.error(f"{func.__name__} 抛出异常: {e}")
            raise
    return wrapper

@log_calls
def divide(a, b):
    return a / b

divide(10, 2)  # 正常执行
divide(10, 0)  # 抛出异常
```

#### 场景3: 缓存装饰器

```python
from functools import wraps, lru_cache

# 自定义简单缓存
def cache(func):
    cached_results = {}
    @wraps(func)
    def wrapper(*args):
        if args in cached_results:
            print(f"从缓存获取: {args}")
            return cached_results[args]
        result = func(*args)
        cached_results[args] = result
        return result
    return wrapper

@cache
def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# 或使用内置的 lru_cache
@lru_cache(maxsize=128)
def fibonacci_fast(n):
    if n < 2:
        return n
    return fibonacci_fast(n-1) + fibonacci_fast(n-2)
```

#### 场景4: 权限验证装饰器

```python
from functools import wraps

def require_auth(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        # 假设从某处获取用户信息
        user = kwargs.get('user')
        if not user or not user.get('is_authenticated'):
            raise PermissionError("需要登录")
        return func(*args, **kwargs)
    return wrapper

@require_auth
def delete_user(user_id, user=None):
    return f"删除用户 {user_id}"

# delete_user(123)  # 抛出 PermissionError
delete_user(123, user={'is_authenticated': True})  # 正常执行
```

### 2.7 类装饰器

```python
class CountCalls:
    """统计函数调用次数的类装饰器"""
    def __init__(self, func):
        self.func = func
        self.count = 0

    def __call__(self, *args, **kwargs):
        self.count += 1
        print(f"{self.func.__name__} 被调用 {self.count} 次")
        return self.func(*args, **kwargs)

@CountCalls
def say_hello():
    print("Hello!")

say_hello()  # 输出: say_hello 被调用 1 次
say_hello()  # 输出: say_hello 被调用 2 次
```

### 2.8 多个装饰器叠加

```python
@timer
@log_calls
@cache
def expensive_function(n):
    time.sleep(1)
    return n * 2

# 执行顺序: cache -> log_calls -> timer -> 原函数
# 等价于: timer(log_calls(cache(expensive_function)))
```

---

## 3. Generators (生成器)

### 3.1 基本概念

生成器是一种特殊的迭代器，使用 `yield` 关键字来产生值，而不是一次性返回所有结果。

**核心特点**：
- **惰性求值**：按需生成值，不会一次性占用大量内存
- **状态保持**：每次调用会从上次暂停的位置继续执行
- **单向迭代**：只能向前遍历，不能回退

### 3.2 创建生成器的两种方式

#### 方式1: 生成器函数（使用 yield）

```python
def simple_generator():
    print("开始")
    yield 1
    print("继续")
    yield 2
    print("结束")
    yield 3

gen = simple_generator()
print(next(gen))  # 输出: 开始 \n 1
print(next(gen))  # 输出: 继续 \n 2
print(next(gen))  # 输出: 结束 \n 3
# print(next(gen))  # 抛出 StopIteration
```

#### 方式2: 生成器表达式

```python
# 列表推导式（一次性生成所有元素）
squares_list = [x**2 for x in range(10)]

# 生成器表达式（按需生成）
squares_gen = (x**2 for x in range(10))

print(type(squares_list))  # <class 'list'>
print(type(squares_gen))   # <class 'generator'>
```

### 3.3 生成器 vs 列表推导式

```python
import sys

# 列表推导式：占用内存大
list_comp = [x**2 for x in range(1000000)]
print(f"列表大小: {sys.getsizeof(list_comp)} bytes")  # ~8MB

# 生成器：占用内存小
gen_exp = (x**2 for x in range(1000000))
print(f"生成器大小: {sys.getsizeof(gen_exp)} bytes")  # ~200 bytes
```

**选择建议**：
- ✅ 需要多次遍历 → 使用列表
- ✅ 只遍历一次 → 使用生成器
- ✅ 数据量大 → 使用生成器
- ✅ 需要索引访问 → 使用列表

### 3.4 生成器的基本操作

```python
def count_up_to(n):
    count = 1
    while count <= n:
        yield count
        count += 1

# 方式1: 使用 next()
gen = count_up_to(3)
print(next(gen))  # 1
print(next(gen))  # 2
print(next(gen))  # 3

# 方式2: 使用 for 循环（推荐）
for num in count_up_to(5):
    print(num)  # 1, 2, 3, 4, 5

# 方式3: 转换为列表
numbers = list(count_up_to(5))
print(numbers)  # [1, 2, 3, 4, 5]
```

### 3.5 实际应用场景

#### 场景1: 读取大文件

```python
# ❌ 错误：一次性读取整个文件（内存占用大）
def read_file_bad(filename):
    with open(filename) as f:
        return f.readlines()  # 加载所有行到内存

# ✅ 正确：使用生成器逐行读取
def read_file_good(filename):
    with open(filename) as f:
        for line in f:
            yield line.strip()

# 使用
for line in read_file_good('large_file.txt'):
    process(line)  # 逐行处理，内存占用小
```

#### 场景2: 无限序列

```python
def fibonacci():
    """无限斐波那契数列生成器"""
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

# 获取前 10 个斐波那契数
fib = fibonacci()
first_10 = [next(fib) for _ in range(10)]
print(first_10)  # [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

#### 场景3: 数据流处理

```python
def process_data_pipeline(data):
    """数据处理管道"""
    # 步骤1: 过滤空值
    filtered = (item for item in data if item)

    # 步骤2: 转换为小写
    lowercased = (item.lower() for item in filtered)

    # 步骤3: 去除空格
    stripped = (item.strip() for item in lowercased)

    return stripped

data = ['  Hello  ', '', 'WORLD', '  Python  ', None]
result = list(process_data_pipeline(data))
print(result)  # ['hello', 'world', 'python']
```

#### 场景4: 分批处理数据

```python
def batch_generator(data, batch_size):
    """将数据分批生成"""
    for i in range(0, len(data), batch_size):
        yield data[i:i + batch_size]

# 使用
data = list(range(100))
for batch in batch_generator(data, batch_size=10):
    print(f"处理批次: {batch[:3]}...")  # 每次处理 10 条数据
```

### 3.6 生成器的高级特性

#### yield from（生成器委托）

```python
def generator1():
    yield 1
    yield 2

def generator2():
    yield 3
    yield 4

# ❌ 传统方式
def combined_old():
    for value in generator1():
        yield value
    for value in generator2():
        yield value

# ✅ 使用 yield from
def combined_new():
    yield from generator1()
    yield from generator2()

print(list(combined_new()))  # [1, 2, 3, 4]
```

#### 生成器的 send() 方法

```python
def echo_generator():
    """可以接收外部输入的生成器"""
    value = None
    while True:
        value = yield value
        if value is not None:
            value = value * 2

gen = echo_generator()
next(gen)  # 启动生成器
print(gen.send(5))   # 输出: 10
print(gen.send(10))  # 输出: 20
```

### 3.7 内置生成器工具（itertools）

```python
from itertools import islice, chain, cycle, repeat, count

# islice: 切片生成器
def infinite_counter():
    n = 0
    while True:
        yield n
        n += 1

first_10 = list(islice(infinite_counter(), 10))
print(first_10)  # [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

# chain: 连接多个迭代器
combined = chain([1, 2, 3], [4, 5, 6])
print(list(combined))  # [1, 2, 3, 4, 5, 6]

# cycle: 无限循环
colors = cycle(['red', 'green', 'blue'])
first_7 = list(islice(colors, 7))
print(first_7)  # ['red', 'green', 'blue', 'red', 'green', 'blue', 'red']

# repeat: 重复元素
repeated = repeat('hello', 3)
print(list(repeated))  # ['hello', 'hello', 'hello']

# count: 无限计数
counter = count(start=10, step=2)
first_5 = list(islice(counter, 5))
print(first_5)  # [10, 12, 14, 16, 18]
```

---

## 4. 三者对比与总结

### 4.1 核心区别

| 特性 | List Comprehension | Decorators | Generators |
|------|-------------------|------------|------------|
| **用途** | 创建列表 | 增强函数功能 | 惰性生成数据 |
| **语法** | `[expr for item in iter]` | `@decorator` | `yield` 关键字 |
| **返回值** | 列表 | 函数 | 生成器对象 |
| **内存占用** | 一次性分配 | 无影响 | 按需分配 |
| **执行时机** | 立即执行 | 函数调用时 | 按需执行 |

### 4.2 使用场景总结

#### List Comprehension 适用场景
- ✅ 数据转换和过滤
- ✅ 需要多次遍历结果
- ✅ 数据量不大（< 10万条）
- ✅ 需要索引访问

```python
# 典型用法
numbers = [x * 2 for x in range(10) if x % 2 == 0]
names = [user['name'] for user in users if user['active']]
```

#### Decorators 适用场景
- ✅ 日志记录
- ✅ 性能监控
- ✅ 权限验证
- ✅ 缓存结果
- ✅ 重试机制

```python
# 典型用法
@timer
@cache
@require_auth
def expensive_operation(user_id):
    # 业务逻辑
    pass
```

#### Generators 适用场景
- ✅ 处理大文件
- ✅ 无限序列
- ✅ 数据流处理
- ✅ 只需遍历一次
- ✅ 内存受限环境

```python
# 典型用法
def read_large_file(filename):
    with open(filename) as f:
        for line in f:
            yield process(line)

# 无限序列
def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b
```

### 4.3 组合使用示例

```python
from functools import wraps
import time

# 装饰器 + 生成器
@timer
def process_data_generator(data):
    """使用装饰器监控生成器性能"""
    for item in data:
        yield item * 2

# 列表推导式 + 生成器
gen = (x**2 for x in range(1000000))
filtered = [x for x in gen if x % 2 == 0]  # 先生成，再过滤

# 装饰器 + 列表推导式
@cache
def get_user_names(users):
    return [user['name'] for user in users]
```

### 4.4 最佳实践

#### List Comprehension 最佳实践
```python
# ✅ 好：简洁清晰
squares = [x**2 for x in range(10)]

# ❌ 坏：过于复杂，难以阅读
result = [x**2 for x in range(100) if x % 2 == 0 if x % 3 == 0 if x > 10]

# ✅ 好：复杂逻辑拆分
def is_valid(x):
    return x % 2 == 0 and x % 3 == 0 and x > 10

result = [x**2 for x in range(100) if is_valid(x)]
```

#### Decorators 最佳实践
```python
# ✅ 好：使用 @wraps 保留元信息
from functools import wraps

def my_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

# ❌ 坏：忘记使用 @wraps
def bad_decorator(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper  # 丢失了原函数的 __name__, __doc__ 等
```

#### Generators 最佳实践
```python
# ✅ 好：使用生成器处理大数据
def process_large_file(filename):
    with open(filename) as f:
        for line in f:
            yield line.strip()

# ❌ 坏：一次性加载到内存
def process_large_file_bad(filename):
    with open(filename) as f:
        return [line.strip() for line in f]  # 内存占用大
```

### 4.5 性能对比

```python
import time
import sys

# 测试数据量
n = 1000000

# 列表推导式
start = time.time()
list_result = [x**2 for x in range(n)]
list_time = time.time() - start
list_memory = sys.getsizeof(list_result)

# 生成器表达式
start = time.time()
gen_result = (x**2 for x in range(n))
gen_time = time.time() - start
gen_memory = sys.getsizeof(gen_result)

print(f"列表推导式: 时间={list_time:.4f}s, 内存={list_memory/1024/1024:.2f}MB")
print(f"生成器表达式: 时间={gen_time:.6f}s, 内存={gen_memory}bytes")

# 输出示例:
# 列表推导式: 时间=0.1234s, 内存=8.00MB
# 生成器表达式: 时间=0.000001s, 内存=200bytes
```

---

## 5. 常见问题与解答

### 5.1 List Comprehension 常见问题

**Q1: 列表推导式可以嵌套多少层？**

A: 理论上没有限制，但建议不超过 2 层，否则可读性会很差。

```python
# ❌ 可读性差
result = [[[z for z in range(y)] for y in range(x)] for x in range(3)]

# ✅ 建议拆分
def create_matrix(x, y, z):
    return [[[z for z in range(z_max)]
             for y in range(y_max)]
            for x in range(x_max)]
```

**Q2: 列表推导式中可以使用多个 if 条件吗？**

A: 可以，多个 if 条件是 AND 关系。

```python
# 多个 if 条件（AND 关系）
result = [x for x in range(20) if x % 2 == 0 if x % 3 == 0]
# 等价于
result = [x for x in range(20) if x % 2 == 0 and x % 3 == 0]
```

### 5.2 Decorators 常见问题

**Q1: 装饰器的执行顺序是什么？**

A: 从下到上装饰，从上到下执行。

```python
@decorator1
@decorator2
@decorator3
def func():
    pass

# 等价于
func = decorator1(decorator2(decorator3(func)))

# 执行顺序: decorator1 -> decorator2 -> decorator3 -> 原函数
```

**Q2: 如何给装饰器传递参数？**

A: 需要再包装一层（装饰器工厂）。

```python
def repeat(times):
    def decorator(func):
        def wrapper(*args, **kwargs):
            for _ in range(times):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(times=3)
def say_hello():
    print("Hello!")
```

### 5.3 Generators 常见问题

**Q1: 生成器只能遍历一次吗？**

A: 是的，生成器是一次性的，遍历完后就耗尽了。

```python
gen = (x**2 for x in range(5))
print(list(gen))  # [0, 1, 4, 9, 16]
print(list(gen))  # [] - 已耗尽
```

**Q2: 如何判断生成器是否耗尽？**

A: 使用 try-except 捕获 StopIteration 异常。

```python
gen = (x for x in range(3))
try:
    while True:
        print(next(gen))
except StopIteration:
    print("生成器已耗尽")
```

**Q3: yield 和 return 的区别？**

A:
- `return` 结束函数执行，返回值
- `yield` 暂停函数执行，返回值，下次调用从暂停处继续

```python
def with_return():
    return 1
    return 2  # 永远不会执行

def with_yield():
    yield 1
    yield 2  # 会执行

print(with_return())  # 1
print(list(with_yield()))  # [1, 2]
```

---

## 6. 快速参考

### 6.1 List Comprehension 语法速查

```python
# 基础语法
[expression for item in iterable]

# 带条件
[expression for item in iterable if condition]

# 嵌套
[expression for item1 in iterable1 for item2 in iterable2]

# 字典推导式
{key: value for item in iterable}

# 集合推导式
{expression for item in iterable}

# 生成器表达式
(expression for item in iterable)
```

### 6.2 Decorators 语法速查

```python
# 基础装饰器
def decorator(func):
    def wrapper(*args, **kwargs):
        # 前置处理
        result = func(*args, **kwargs)
        # 后置处理
        return result
    return wrapper

# 带参数的装饰器
def decorator_with_args(arg):
    def decorator(func):
        def wrapper(*args, **kwargs):
            return func(*args, **kwargs)
        return wrapper
    return decorator

# 类装饰器
class Decorator:
    def __init__(self, func):
        self.func = func
    def __call__(self, *args, **kwargs):
        return self.func(*args, **kwargs)
```

### 6.3 Generators 语法速查

```python
# 生成器函数
def generator():
    yield value

# 生成器表达式
gen = (expression for item in iterable)

# 生成器方法
next(gen)           # 获取下一个值
gen.send(value)     # 发送值给生成器
gen.close()         # 关闭生成器
gen.throw(exc)      # 抛出异常

# yield from
def combined():
    yield from generator1()
    yield from generator2()
```

---

## 7. 总结

### 核心要点

1. **List Comprehension（列表推导式）**
   - 用于快速创建列表
   - 语法简洁，性能优于传统循环
   - 适合数据转换和过滤
   - 注意：数据量大时考虑使用生成器

2. **Decorators（装饰器）**
   - 用于增强函数功能，不修改原函数代码
   - 常用于日志、缓存、权限验证等横切关注点
   - 记得使用 `@wraps` 保留函数元信息
   - 可以叠加使用多个装饰器

3. **Generators（生成器）**
   - 用于惰性求值，按需生成数据
   - 内存效率高，适合处理大数据
   - 使用 `yield` 关键字实现
   - 只能遍历一次，不支持索引访问

### 选择建议

```
需要创建列表？
├─ 数据量小（< 10万）→ List Comprehension
└─ 数据量大 → Generator Expression

需要增强函数功能？
└─ Decorators

需要处理大数据流？
└─ Generators
```

### 学习路径建议

1. **初学者**：先掌握 List Comprehension，它最简单实用
2. **进阶**：学习 Decorators，理解高阶函数概念
3. **高级**：深入 Generators，掌握惰性求值和内存优化

---

## 8. 参考资料

- [Python 官方文档 - List Comprehensions](https://docs.python.org/3/tutorial/datastructures.html#list-comprehensions)
- [Python 官方文档 - Decorators](https://docs.python.org/3/glossary.html#term-decorator)
- [Python 官方文档 - Generators](https://docs.python.org/3/tutorial/classes.html#generators)
- [PEP 289 - Generator Expressions](https://www.python.org/dev/peps/pep-0289/)
- [PEP 318 - Decorators for Functions and Methods](https://www.python.org/dev/peps/pep-0318/)
- [Real Python - Python Decorators](https://realpython.com/primer-on-python-decorators/)
- [Real Python - Python Generators](https://realpython.com/introduction-to-python-generators/)

---

**文档版本**: v1.0
**最后更新**: 2026-01-16
**作者**: Claude Code
