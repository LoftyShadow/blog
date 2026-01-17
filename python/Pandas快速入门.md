# Pandas 快速入门

> 强大的数据分析处理库

---

## 1. Pandas 简介

### 1.1 什么是 Pandas？

Pandas 是基于 NumPy 构建的数据分析库，提供高效的数据结构和数据分析工具。

**核心特点**：
- 📊 **DataFrame**：类似 Excel 的表格数据结构
- 🔄 **数据处理**：清洗、转换、合并、重塑
- 📈 **时间序列**：强大的时间序列处理能力
- 📁 **文件读写**：支持 CSV、Excel、SQL、JSON 等
- 🎯 **高性能**：底层基于 NumPy，运算高效

### 1.2 核心数据结构

```python
import pandas as pd

# Series - 一维数据（类似列表）
s = pd.Series([1, 2, 3, 4, 5])
print(s)

# DataFrame - 二维数据（类似表格）
df = pd.DataFrame({
    'name': ['Alice', 'Bob', 'Charlie'],
    'age': [25, 30, 35],
    'city': ['Beijing', 'Shanghai', 'Guangzhou']
})
print(df)
```

---

## 2. 安装与导入

```bash
# 安装 Pandas
pip install pandas

# 同时安装常用依赖
pip install pandas openpyxl xlrd
```

```python
import pandas as pd
import numpy as np

# 查看版本
print(pd.__version__)
```

---

## 3. 创建 DataFrame

### 3.1 从字典创建

```python
# 方式1：字典的值为列表
df = pd.DataFrame({
    'name': ['Alice', 'Bob', 'Charlie'],
    'age': [25, 30, 35],
    'salary': [50000, 60000, 70000]
})
print(df)
```

### 3.2 从列表创建

```python
# 方式2：列表的列表
data = [
    ['Alice', 25, 50000],
    ['Bob', 30, 60000],
    ['Charlie', 35, 70000]
]
df = pd.DataFrame(data, columns=['name', 'age', 'salary'])
print(df)
```

### 3.3 从文件读取

```python
# 读取 CSV
df = pd.read_csv('data.csv')

# 读取 Excel
df = pd.read_excel('data.xlsx', sheet_name='Sheet1')

# 读取 JSON
df = pd.read_json('data.json')

# 读取 SQL
import sqlite3
conn = sqlite3.connect('database.db')
df = pd.read_sql('SELECT * FROM users', conn)
```

---

## 4. 查看数据

```python
df = pd.DataFrame({
    'name': ['Alice', 'Bob', 'Charlie', 'David', 'Eve'],
    'age': [25, 30, 35, 40, 45],
    'salary': [50000, 60000, 70000, 80000, 90000]
})

# 查看前几行
print(df.head())      # 默认前 5 行
print(df.head(3))     # 前 3 行

# 查看后几行
print(df.tail())      # 默认后 5 行

# 查看基本信息
print(df.info())      # 数据类型、非空值数量
print(df.describe())  # 统计摘要
print(df.shape)       # (5, 3) - 形状
print(df.columns)     # 列名
print(df.dtypes)      # 数据类型
```

---

## 5. 数据选择

### 5.1 选择列

```python
# 单列（返回 Series）
print(df['name'])

# 多列（返回 DataFrame）
print(df[['name', 'age']])
```

### 5.2 选择行

```python
# 按位置选择
print(df.iloc[0])        # 第一行
print(df.iloc[0:3])      # 前三行
print(df.iloc[[0, 2]])   # 第 1 和第 3 行

# 按标签选择
print(df.loc[0])         # 索引为 0 的行
print(df.loc[0:2])       # 索引 0 到 2 的行
```

### 5.3 条件筛选

```python
# 单条件
print(df[df['age'] > 30])

# 多条件
print(df[(df['age'] > 25) & (df['salary'] < 80000)])

# 使用 isin
print(df[df['name'].isin(['Alice', 'Bob'])])
```

---

## 6. 数据操作

### 6.1 添加列

```python
# 新增列
df['bonus'] = df['salary'] * 0.1

# 基于条件添加
df['level'] = df['age'].apply(lambda x: 'Senior' if x > 35 else 'Junior')
```

### 6.2 删除列/行

```python
# 删除列
df = df.drop('bonus', axis=1)
df = df.drop(columns=['bonus'])

# 删除行
df = df.drop(0, axis=0)  # 删除索引为 0 的行
df = df.drop(index=[0, 1])
```

### 6.3 排序

```python
# 按列排序
df_sorted = df.sort_values('age')  # 升序
df_sorted = df.sort_values('age', ascending=False)  # 降序

# 多列排序
df_sorted = df.sort_values(['age', 'salary'], ascending=[True, False])
```

---

## 7. 数据清洗

```python
# 处理缺失值
df = df.dropna()  # 删除包含缺失值的行
df = df.fillna(0)  # 用 0 填充缺失值
df = df.fillna(df.mean())  # 用平均值填充

# 删除重复行
df = df.drop_duplicates()

# 重命名列
df = df.rename(columns={'old_name': 'new_name'})
```

---

## 8. 分组聚合

```python
# 按列分组
grouped = df.groupby('level')

# 聚合函数
print(grouped['salary'].mean())  # 平均工资
print(grouped['salary'].sum())   # 总工资
print(grouped.size())             # 每组数量

# 多个聚合
print(grouped['salary'].agg(['mean', 'sum', 'count']))
```

---

## 9. 数据合并

```python
df1 = pd.DataFrame({'key': ['A', 'B', 'C'], 'value1': [1, 2, 3]})
df2 = pd.DataFrame({'key': ['A', 'B', 'D'], 'value2': [4, 5, 6]})

# 合并（类似 SQL JOIN）
merged = pd.merge(df1, df2, on='key', how='inner')  # 内连接
merged = pd.merge(df1, df2, on='key', how='outer')  # 外连接
merged = pd.merge(df1, df2, on='key', how='left')   # 左连接

# 拼接
concatenated = pd.concat([df1, df2], axis=0)  # 垂直拼接
```

---

## 10. 数据导出

```python
# 导出 CSV
df.to_csv('output.csv', index=False)

# 导出 Excel
df.to_excel('output.xlsx', sheet_name='Sheet1', index=False)

# 导出 JSON
df.to_json('output.json', orient='records')
```

---

**文档版本**: v1.0
**最后更新**: 2026-01-16
**作者**: Claude Code
