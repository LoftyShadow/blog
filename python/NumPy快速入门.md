# NumPy 快速入门

> 高性能数值计算库

---

## 1. NumPy 简介

### 1.1 什么是 NumPy？

NumPy（Numerical Python）是 Python 科学计算的基础库，提供高性能的多维数组对象和数学运算功能。

**核心特点**：
- 🚀 **高性能**：底层用 C 语言实现，比 Python 列表快 10-100 倍
- 📊 **多维数组**：提供强大的 ndarray 对象
- 🔢 **数学函数**：丰富的数学、统计、线性代数函数
- 🔗 **广播机制**：自动处理不同形状的数组运算
- 🎯 **内存高效**：连续内存存储，占用空间小

### 1.2 为什么使用 NumPy？

```python
# Python 列表 vs NumPy 数组
import numpy as np
import time

# Python 列表
python_list = list(range(1000000))
start = time.time()
result = [x * 2 for x in python_list]
print(f"Python 列表: {time.time() - start:.4f}秒")

# NumPy 数组
numpy_array = np.arange(1000000)
start = time.time()
result = numpy_array * 2
print(f"NumPy 数组: {time.time() - start:.4f}秒")

# NumPy 通常快 10-100 倍
```

---

## 2. 安装与导入

### 2.1 安装 NumPy

```bash
# 使用 pip 安装
pip install numpy

# 使用 conda 安装
conda install numpy
```

### 2.2 导入 NumPy

```python
import numpy as np

# 查看版本
print(np.__version__)
```

---

## 3. 创建数组

### 3.1 从列表创建

```python
import numpy as np

# 一维数组
arr1 = np.array([1, 2, 3, 4, 5])
print(arr1)  # [1 2 3 4 5]

# 二维数组
arr2 = np.array([[1, 2, 3], [4, 5, 6]])
print(arr2)
# [[1 2 3]
#  [4 5 6]]

# 三维数组
arr3 = np.array([[[1, 2], [3, 4]], [[5, 6], [7, 8]]])
print(arr3.shape)  # (2, 2, 2)
```

### 3.2 使用内置函数创建

```python
# 全零数组
zeros = np.zeros((3, 4))
print(zeros)

# 全一数组
ones = np.ones((2, 3))
print(ones)

# 指定值填充
full = np.full((2, 2), 7)
print(full)  # [[7 7] [7 7]]

# 单位矩阵
identity = np.eye(3)
print(identity)

# 等差数列
arange = np.arange(0, 10, 2)  # 起始、结束、步长
print(arange)  # [0 2 4 6 8]

# 等间隔数列
linspace = np.linspace(0, 1, 5)  # 起始、结束、数量
print(linspace)  # [0.   0.25 0.5  0.75 1.  ]

# 随机数组
random = np.random.rand(2, 3)  # 0-1 之间的随机数
print(random)

random_int = np.random.randint(0, 10, (3, 3))  # 随机整数
print(random_int)
```

---

## 4. 数组属性

```python
arr = np.array([[1, 2, 3], [4, 5, 6]])

print(arr.shape)      # (2, 3) - 形状
print(arr.ndim)       # 2 - 维度
print(arr.size)       # 6 - 元素总数
print(arr.dtype)      # int64 - 数据类型
print(arr.itemsize)   # 8 - 每个元素字节数
print(arr.nbytes)     # 48 - 总字节数
```

---

## 5. 数组索引与切片

### 5.1 基础索引

```python
arr = np.array([1, 2, 3, 4, 5])

print(arr[0])      # 1 - 第一个元素
print(arr[-1])     # 5 - 最后一个元素
print(arr[1:4])    # [2 3 4] - 切片
print(arr[::2])    # [1 3 5] - 步长为 2
```

### 5.2 多维数组索引

```python
arr = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])

print(arr[0, 0])      # 1 - 第一行第一列
print(arr[1, 2])      # 6 - 第二行第三列
print(arr[0])         # [1 2 3] - 第一行
print(arr[:, 0])      # [1 4 7] - 第一列
print(arr[0:2, 1:3])  # [[2 3] [5 6]] - 切片
```

### 5.3 布尔索引

```python
arr = np.array([1, 2, 3, 4, 5])

# 条件筛选
mask = arr > 3
print(mask)        # [False False False  True  True]
print(arr[mask])   # [4 5]

# 直接使用条件
print(arr[arr > 3])  # [4 5]
print(arr[(arr > 2) & (arr < 5)])  # [3 4]
```

---

## 6. 数组运算

### 6.1 基础运算

```python
arr1 = np.array([1, 2, 3])
arr2 = np.array([4, 5, 6])

print(arr1 + arr2)   # [5 7 9] - 加法
print(arr1 - arr2)   # [-3 -3 -3] - 减法
print(arr1 * arr2)   # [4 10 18] - 乘法
print(arr1 / arr2)   # [0.25 0.4  0.5] - 除法
print(arr1 ** 2)     # [1 4 9] - 幂运算
```

### 6.2 矩阵运算

```python
A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])

# 矩阵乘法
print(np.dot(A, B))  # 或 A @ B
# [[19 22]
#  [43 50]]

# 转置
print(A.T)
# [[1 3]
#  [2 4]]

# 逆矩阵
print(np.linalg.inv(A))

# 行列式
print(np.linalg.det(A))
```

---

## 7. 统计函数

```python
arr = np.array([1, 2, 3, 4, 5])

print(np.sum(arr))      # 15 - 求和
print(np.mean(arr))     # 3.0 - 平均值
print(np.median(arr))   # 3.0 - 中位数
print(np.std(arr))      # 1.41... - 标准差
print(np.var(arr))      # 2.0 - 方差
print(np.min(arr))      # 1 - 最小值
print(np.max(arr))      # 5 - 最大值
print(np.argmin(arr))   # 0 - 最小值索引
print(np.argmax(arr))   # 4 - 最大值索引
```

---

## 8. 数组形状操作

```python
arr = np.array([[1, 2, 3], [4, 5, 6]])

# 重塑
reshaped = arr.reshape(3, 2)
print(reshaped)
# [[1 2]
#  [3 4]
#  [5 6]]

# 展平
flattened = arr.flatten()
print(flattened)  # [1 2 3 4 5 6]

# 转置
transposed = arr.T
print(transposed)
# [[1 4]
#  [2 5]
#  [3 6]]
```

---

## 9. 数组拼接与分割

```python
arr1 = np.array([[1, 2], [3, 4]])
arr2 = np.array([[5, 6], [7, 8]])

# 垂直拼接
vstack = np.vstack((arr1, arr2))
print(vstack)
# [[1 2]
#  [3 4]
#  [5 6]
#  [7 8]]

# 水平拼接
hstack = np.hstack((arr1, arr2))
print(hstack)
# [[1 2 5 6]
#  [3 4 7 8]]

# 分割
arr = np.array([1, 2, 3, 4, 5, 6])
split = np.split(arr, 3)
print(split)  # [array([1, 2]), array([3, 4]), array([5, 6])]
```

---

**文档版本**: v1.0
**最后更新**: 2026-01-16
**作者**: Claude Code
