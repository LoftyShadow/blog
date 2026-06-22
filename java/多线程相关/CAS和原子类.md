# CAS 和原子类

CAS 是 Java 并发包中大量无锁算法的基础。`AtomicInteger`、`ConcurrentHashMap`、AQS、`LongAdder` 等都大量依赖 CAS。

---

## 1. CAS 是什么

CAS 全称是 Compare-And-Swap，也叫 Compare-And-Set。

它包含三个操作数：

```text
内存位置 V
预期值 A
新值 B
```

只有当内存位置 `V` 的当前值等于预期值 `A` 时，才会把它更新为 `B`；否则更新失败。

伪代码：

```java
boolean cas(V, A, B) {
    if (V == A) {
        V = B;
        return true;
    }
    return false;
}
```

真实 CAS 是 CPU 原子指令支持的，不会被线程切换打断。

---

## 2. CAS 为什么能实现无锁并发

传统加锁思路：

```text
加锁 -> 修改共享变量 -> 解锁
```

CAS 思路：

```text
读取旧值 -> 计算新值 -> CAS 尝试更新 -> 失败则重试
```

例如 `AtomicInteger.incrementAndGet()` 可以简化理解为：

```java
for (;;) {
    int oldValue = get();
    int newValue = oldValue + 1;
    if (compareAndSet(oldValue, newValue)) {
        return newValue;
    }
}
```

竞争不激烈时，CAS 避免了线程阻塞和唤醒，性能通常很好。

---

## 3. CAS 的问题

### 3.1 ABA 问题

线程 1 读取到值 `A`，准备 CAS 更新。

期间线程 2 把值从 `A` 改成 `B`，又从 `B` 改回 `A`。

线程 1 再 CAS 时发现还是 `A`，会误以为值没有被修改过。

解决方式：

*   增加版本号。
*   使用 `AtomicStampedReference`。
*   使用 `AtomicMarkableReference`。

### 3.2 自旋开销

CAS 失败后通常会自旋重试。竞争激烈时，大量线程反复 CAS 会消耗 CPU。

### 3.3 只能保证单变量原子更新

普通 CAS 只能保证一个变量的原子更新。多个变量之间的一致性需要额外设计，例如封装成一个对象引用后用 `AtomicReference` 更新。

---

## 4. Atomic 原子类

常见原子类：

| 类型 | 示例 |
| :--- | :--- |
| 基本类型 | `AtomicInteger`、`AtomicLong`、`AtomicBoolean` |
| 引用类型 | `AtomicReference` |
| 带版本引用 | `AtomicStampedReference` |
| 数组类型 | `AtomicIntegerArray`、`AtomicReferenceArray` |
| 字段更新器 | `AtomicIntegerFieldUpdater` |
| 高并发累加 | `LongAdder`、`LongAccumulator` |

---

## 5. `AtomicLong` 和 `LongAdder`

`AtomicLong` 在高并发累加时，所有线程都竞争同一个变量：

```text
多个线程 -> 同一个 value CAS
```

竞争越激烈，CAS 失败越多。

`LongAdder` 的思路是分散热点：

```text
base + Cell[0] + Cell[1] + ... + Cell[n]
```

低竞争时更新 `base`，高竞争时把计数分散到不同 `Cell`，最后求和。

对比：

| 场景 | 推荐 |
| :--- | :--- |
| 需要精确即时值 | `AtomicLong` |
| 高并发计数、统计指标 | `LongAdder` |
| 写多读少 | `LongAdder` |
| 强一致读 | `AtomicLong` |

`LongAdder.sum()` 不是强一致快照，因为求和过程中其他线程仍可能更新。

---

## 6. Unsafe 和 VarHandle

早期原子类底层主要依赖 `Unsafe` 提供 CAS 能力。

Java 9 之后提供了 `VarHandle`，可以用更标准的方式操作变量句柄，并支持不同内存语义的读写和 CAS。

日常开发一般不需要直接写 `Unsafe` 代码，但理解原子类时要知道：

*   CAS 最终依赖底层 CPU 原子指令。
*   Java 原子类对这些能力做了封装。
*   直接使用 `Unsafe` 风险较高，业务代码通常不推荐。

---

## 7. CAS 和 synchronized 怎么选

| 对比点 | CAS | synchronized |
| :--- | :--- | :--- |
| 阻塞 | 不阻塞，失败自旋 | 竞争失败会阻塞 |
| 适合场景 | 竞争较低、操作短小 | 临界区复杂、竞争较高 |
| CPU 消耗 | 高竞争下可能很高 | 阻塞后 CPU 消耗较低 |
| 编程复杂度 | 容易出现 ABA、自旋问题 | 语义清晰 |

不是所有场景都适合无锁。临界区逻辑复杂或竞争非常激烈时，锁反而更稳定。

---

## 8. 理解检查

**CAS 为什么是原子的？**

因为 CAS 由底层 CPU 原子指令支持，比较和更新是不可分割的。

**CAS 一定比锁快吗？**

不一定。低竞争下 CAS 通常更快；高竞争下大量自旋失败会浪费 CPU，锁可能更合适。

**ABA 怎么解决？**

给值加版本号，例如使用 `AtomicStampedReference`。

**`LongAdder` 为什么快？**

它把单点 CAS 竞争分散到多个 `Cell` 上，降低热点竞争。

---

## 9. 总结

CAS 的核心是“乐观尝试”：认为没有冲突，更新失败再重试。它适合短小、低冲突的原子更新。高并发计数场景可以用 `LongAdder` 分散竞争，但如果需要强一致即时值，仍然要谨慎选择。
