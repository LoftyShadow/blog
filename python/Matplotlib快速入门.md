# Matplotlib 快速入门

> Python 数据可视化库

---

## 1. Matplotlib 简介

### 1.1 什么是 Matplotlib？

Matplotlib 是 Python 最流行的数据可视化库，提供类似 MATLAB 的绘图接口，可以创建各种静态、动态和交互式图表。

**核心特点**：
- 📊 **丰富图表**：折线图、柱状图、散点图、饼图等
- 🎨 **高度定制**：颜色、样式、标签、图例完全可控
- 📈 **科学绘图**：支持数学公式、多子图、3D 绘图
- 💾 **多格式导出**：PNG、PDF、SVG、EPS 等
- 🔗 **生态集成**：与 NumPy、Pandas 无缝配合

### 1.2 两种绘图接口

```python
import matplotlib.pyplot as plt
import numpy as np

# 方式1：pyplot 接口（类似 MATLAB，简单快捷）
plt.plot([1, 2, 3], [1, 4, 9])
plt.show()

# 方式2：面向对象接口（推荐，更灵活）
fig, ax = plt.subplots()
ax.plot([1, 2, 3], [1, 4, 9])
plt.show()
```

---

## 2. 安装与导入

```bash
# 安装 Matplotlib
pip install matplotlib

# 同时安装常用依赖
pip install matplotlib numpy pandas
```

```python
import matplotlib.pyplot as plt
import numpy as np

# 查看版本
print(plt.matplotlib.__version__)

# 设置中文字体（解决中文显示问题）
plt.rcParams['font.sans-serif'] = ['SimHei']  # 黑体
plt.rcParams['axes.unicode_minus'] = False    # 解决负号显示问题
```

---

## 3. 基础绘图

### 3.1 折线图

```python
import matplotlib.pyplot as plt
import numpy as np

# 数据
x = np.linspace(0, 10, 100)
y = np.sin(x)

# 绘图
plt.plot(x, y)
plt.title('正弦函数')
plt.xlabel('x 轴')
plt.ylabel('y 轴')
plt.grid(True)
plt.show()
```

### 3.2 多条曲线

```python
x = np.linspace(0, 10, 100)
y1 = np.sin(x)
y2 = np.cos(x)

plt.plot(x, y1, label='sin(x)', color='blue', linestyle='-', linewidth=2)
plt.plot(x, y2, label='cos(x)', color='red', linestyle='--', linewidth=2)
plt.title('三角函数')
plt.xlabel('x')
plt.ylabel('y')
plt.legend()  # 显示图例
plt.grid(True, alpha=0.3)
plt.show()
```

---

## 4. 常用图表类型

### 4.1 柱状图

```python
# 数据
categories = ['A', 'B', 'C', 'D', 'E']
values = [23, 45, 56, 78, 32]

# 绘图
plt.bar(categories, values, color='skyblue', edgecolor='black')
plt.title('柱状图示例')
plt.xlabel('类别')
plt.ylabel('数值')
plt.show()
```

### 4.2 水平柱状图

```python
plt.barh(categories, values, color='lightgreen', edgecolor='black')
plt.title('水平柱状图')
plt.xlabel('数值')
plt.ylabel('类别')
plt.show()
```

### 4.3 散点图

```python
# 数据
x = np.random.rand(50)
y = np.random.rand(50)
colors = np.random.rand(50)
sizes = 1000 * np.random.rand(50)

# 绘图
plt.scatter(x, y, c=colors, s=sizes, alpha=0.5, cmap='viridis')
plt.colorbar()  # 显示颜色条
plt.title('散点图示例')
plt.xlabel('X 轴')
plt.ylabel('Y 轴')
plt.show()
```

### 4.4 饼图

```python
# 数据
labels = ['Python', 'Java', 'JavaScript', 'C++', 'Go']
sizes = [35, 25, 20, 15, 5]
colors = ['#ff9999', '#66b3ff', '#99ff99', '#ffcc99', '#ff99cc']
explode = (0.1, 0, 0, 0, 0)  # 突出第一块

# 绘图
plt.pie(sizes, explode=explode, labels=labels, colors=colors,
        autopct='%1.1f%%', shadow=True, startangle=90)
plt.title('编程语言使用占比')
plt.axis('equal')  # 保持圆形
plt.show()
```

### 4.5 直方图

```python
# 数据
data = np.random.randn(1000)

# 绘图
plt.hist(data, bins=30, color='steelblue', edgecolor='black', alpha=0.7)
plt.title('正态分布直方图')
plt.xlabel('数值')
plt.ylabel('频数')
plt.grid(True, alpha=0.3)
plt.show()
```

---

## 5. 子图布局

### 5.1 基础子图

```python
fig, axes = plt.subplots(2, 2, figsize=(10, 8))

# 子图1：折线图
axes[0, 0].plot([1, 2, 3], [1, 4, 9])
axes[0, 0].set_title('折线图')

# 子图2：柱状图
axes[0, 1].bar(['A', 'B', 'C'], [3, 7, 5])
axes[0, 1].set_title('柱状图')

# 子图3：散点图
axes[1, 0].scatter(np.random.rand(20), np.random.rand(20))
axes[1, 0].set_title('散点图')

# 子图4：饼图
axes[1, 1].pie([30, 40, 30], labels=['X', 'Y', 'Z'], autopct='%1.1f%%')
axes[1, 1].set_title('饼图')

plt.tight_layout()  # 自动调整子图间距
plt.show()
```

### 5.2 不规则子图

```python
fig = plt.figure(figsize=(10, 6))

# 左侧大图
ax1 = plt.subplot(1, 2, 1)
ax1.plot([1, 2, 3], [1, 4, 9])
ax1.set_title('主图')

# 右上小图
ax2 = plt.subplot(2, 2, 2)
ax2.bar(['A', 'B'], [3, 5])
ax2.set_title('子图1')

# 右下小图
ax3 = plt.subplot(2, 2, 4)
ax3.scatter([1, 2, 3], [2, 3, 1])
ax3.set_title('子图2')

plt.tight_layout()
plt.show()
```

---

## 6. 样式定制

### 6.1 线条样式

```python
x = np.linspace(0, 10, 100)

plt.plot(x, x, label='实线', linestyle='-', linewidth=2)
plt.plot(x, x+1, label='虚线', linestyle='--', linewidth=2)
plt.plot(x, x+2, label='点线', linestyle=':', linewidth=2)
plt.plot(x, x+3, label='点划线', linestyle='-.', linewidth=2)

plt.legend()
plt.title('线条样式')
plt.show()
```

### 6.2 颜色设置

```python
x = np.linspace(0, 10, 100)

# 方式1：颜色名称
plt.plot(x, x, color='red', label='red')

# 方式2：缩写
plt.plot(x, x+1, color='b', label='blue')

# 方式3：十六进制
plt.plot(x, x+2, color='#FF5733', label='hex')

# 方式4：RGB 元组
plt.plot(x, x+3, color=(0.1, 0.2, 0.5), label='rgb')

plt.legend()
plt.show()
```

### 6.3 标记样式

```python
x = [1, 2, 3, 4, 5]
y = [2, 4, 6, 8, 10]

plt.plot(x, y, marker='o', markersize=10, markerfacecolor='red',
         markeredgecolor='black', markeredgewidth=2,
         linestyle='-', linewidth=2, color='blue')
plt.title('标记样式')
plt.show()
```

---

## 7. 图表元素

### 7.1 标题和标签

```python
x = np.linspace(0, 10, 100)
y = np.sin(x)

plt.plot(x, y)
plt.title('正弦函数图', fontsize=16, fontweight='bold')
plt.xlabel('时间 (秒)', fontsize=12)
plt.ylabel('振幅', fontsize=12)
plt.show()
```

### 7.2 图例

```python
x = np.linspace(0, 10, 100)

plt.plot(x, np.sin(x), label='sin(x)')
plt.plot(x, np.cos(x), label='cos(x)')

# 图例位置：'upper left', 'upper right', 'lower left', 'lower right', 'center'
plt.legend(loc='upper right', fontsize=10, frameon=True, shadow=True)
plt.show()
```

### 7.3 网格

```python
x = np.linspace(0, 10, 100)
y = np.sin(x)

plt.plot(x, y)
plt.grid(True, linestyle='--', alpha=0.5, color='gray')
plt.title('带网格的图表')
plt.show()
```

### 7.4 坐标轴范围

```python
x = np.linspace(0, 10, 100)
y = np.sin(x)

plt.plot(x, y)
plt.xlim(0, 10)   # x 轴范围
plt.ylim(-1.5, 1.5)  # y 轴范围
plt.title('自定义坐标轴范围')
plt.show()
```

---

## 8. 保存图表

```python
x = np.linspace(0, 10, 100)
y = np.sin(x)

plt.plot(x, y)
plt.title('正弦函数')

# 保存为不同格式
plt.savefig('sine_wave.png', dpi=300, bbox_inches='tight')  # PNG
plt.savefig('sine_wave.pdf', bbox_inches='tight')           # PDF
plt.savefig('sine_wave.svg', bbox_inches='tight')           # SVG

plt.show()
```

**参数说明**：
- `dpi`：分辨率（默认 100）
- `bbox_inches='tight'`：去除多余空白
- `transparent=True`：透明背景

---

## 9. 与 Pandas 集成

```python
import pandas as pd
import matplotlib.pyplot as plt

# 创建数据
df = pd.DataFrame({
    'month': ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    'sales': [120, 150, 180, 200, 170],
    'profit': [30, 40, 50, 60, 45]
})

# 方式1：Pandas 内置绘图
df.plot(x='month', y=['sales', 'profit'], kind='bar', figsize=(10, 6))
plt.title('月度销售与利润')
plt.ylabel('金额')
plt.show()

# 方式2：Matplotlib 绘图
plt.figure(figsize=(10, 6))
plt.plot(df['month'], df['sales'], marker='o', label='销售额')
plt.plot(df['month'], df['profit'], marker='s', label='利润')
plt.title('月度销售与利润')
plt.xlabel('月份')
plt.ylabel('金额')
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()
```

---

## 10. 常用样式主题

```python
# 查看可用样式
print(plt.style.available)

# 使用样式
plt.style.use('seaborn-v0_8-darkgrid')  # 或 'ggplot', 'fivethirtyeight'

x = np.linspace(0, 10, 100)
plt.plot(x, np.sin(x), label='sin(x)')
plt.plot(x, np.cos(x), label='cos(x)')
plt.legend()
plt.title('使用 seaborn 样式')
plt.show()

# 恢复默认样式
plt.style.use('default')
```

---

## 11. 实战示例

### 11.1 股票价格走势图

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# 模拟股票数据
dates = pd.date_range('2024-01-01', periods=100)
price = 100 + np.cumsum(np.random.randn(100) * 2)

plt.figure(figsize=(12, 6))
plt.plot(dates, price, linewidth=2, color='steelblue')
plt.fill_between(dates, price, alpha=0.3, color='skyblue')
plt.title('股票价格走势图', fontsize=16, fontweight='bold')
plt.xlabel('日期', fontsize=12)
plt.ylabel('价格 (元)', fontsize=12)
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()
```

### 11.2 多指标对比图

```python
categories = ['产品A', '产品B', '产品C', '产品D', '产品E']
sales_2023 = [120, 150, 180, 200, 170]
sales_2024 = [140, 160, 200, 220, 190]

x = np.arange(len(categories))
width = 0.35

fig, ax = plt.subplots(figsize=(10, 6))
bars1 = ax.bar(x - width/2, sales_2023, width, label='2023年', color='skyblue')
bars2 = ax.bar(x + width/2, sales_2024, width, label='2024年', color='lightcoral')

ax.set_xlabel('产品', fontsize=12)
ax.set_ylabel('销售额 (万元)', fontsize=12)
ax.set_title('产品销售额对比', fontsize=16, fontweight='bold')
ax.set_xticks(x)
ax.set_xticklabels(categories)
ax.legend()
ax.grid(True, alpha=0.3, axis='y')

plt.tight_layout()
plt.show()
```

---

**文档版本**: v1.0
**最后更新**: 2026-01-16
**作者**: Claude Code
