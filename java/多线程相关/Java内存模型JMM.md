# Java 内存模型 JMM

JMM（Java Memory Model）定义了线程之间如何通过内存进行交互。它解决的不是 JVM 内存区域划分问题，而是并发场景下的可见性、有序性和原子性问题。

---

## 1. JMM 解决什么问题

多线程程序中，每个线程可能把共享变量读到 CPU 缓存或寄存器中。一个线程修改了变量，另一个线程不一定马上能看到。

JMM 要解决的问题包括：

*   一个线程修改共享变量后，其他线程什么时候能看到。
*   编译器和 CPU 能不能重排序指令。
*   哪些操作天然具备原子性。
*   `volatile`、`synchronized`、`final` 等关键字提供什么内存语义。

---

## 2. 主内存和工作内存

可以用一个简化模型理解：

```text
主内存：保存共享变量
工作内存：每个线程自己的变量副本
```

线程对共享变量的操作通常不是直接操作主内存，而是：

```text
从主内存读取变量到工作内存
在线程工作内存中修改
再刷新回主内存
```

这就是可见性问题的来源。

---

## 3. 并发三大特性

### 3.1 原子性

一个操作不可被中断，要么全部执行成功，要么不执行。

例如：

```java
i++;
```

这不是原子操作，它包含：

```text
读取 i
加 1
写回 i
```

多线程同时执行会丢失更新。

### 3.2 可见性

一个线程修改共享变量后，其他线程能及时看到。

`volatile`、`synchronized`、`Lock` 都可以提供可见性保证。

### 3.3 有序性

程序代码的执行顺序和实际执行顺序不一定完全一致。编译器和 CPU 可能为了优化进行指令重排序。

只要单线程结果不变，重排序是允许的。但在多线程中，重排序可能造成错误。

---

## 4. happens-before 规则

`happens-before` 是 JMM 中判断可见性的核心规则。如果 A happens-before B，那么 A 的结果对 B 可见。

常见规则：

| 规则 | 含义 |
| :--- | :--- |
| 程序次序规则 | 同一个线程中，前面的操作 happens-before 后面的操作 |
| 监视器锁规则 | 对一个锁的 unlock happens-before 后续对这个锁的 lock |
| volatile 规则 | 对 volatile 变量的写 happens-before 后续对它的读 |
| 线程启动规则 | `Thread.start()` happens-before 线程内的操作 |
| 线程终止规则 | 线程内操作 happens-before 其他线程检测到它结束 |
| 传递性 | A happens-before B，B happens-before C，则 A happens-before C |

---

## 5. volatile 的内存语义

`volatile` 提供两类保证：

*   可见性：写入 `volatile` 变量会刷新到主内存，读取会从主内存获取最新值。
*   禁止特定重排序：`volatile` 写前的普通写不能被重排到 `volatile` 写之后；`volatile` 读后的普通读不能被重排到 `volatile` 读之前。

`volatile` 不保证复合操作的原子性。

例如：

```java
volatile int count = 0;
count++;
```

这里的 `count++` 仍然不是线程安全的。

---

## 6. synchronized 的内存语义

进入同步块时：

```text
lock
```

线程会从主内存重新读取共享变量。

退出同步块时：

```text
unlock
```

线程会把修改刷新回主内存。

因此，`synchronized` 同时保证：

*   原子性：同一时间只有一个线程进入临界区。
*   可见性：释放锁前的修改对后续获取同一把锁的线程可见。
*   有序性：同步块内外有内存屏障约束。

---

## 7. DCL 单例为什么要加 volatile

双重检查锁常见写法：

```java
class Singleton {
    private static volatile Singleton instance;

    static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
```

对象创建不是一个原子动作，可能被拆成：

```text
分配内存
初始化对象
引用指向内存
```

如果没有 `volatile`，后两步可能重排序。其他线程可能看到一个非空但未初始化完成的对象。

`volatile` 可以禁止这种重排序。

---

## 8. final 的内存语义

`final` 字段在构造函数中完成初始化后，只要对象没有在构造期间逸出，其他线程看到这个对象时，也能看到 `final` 字段的正确值。

这也是不可变对象适合并发共享的重要原因。

---

## 9. 理解检查

**JMM 和 JVM 运行时数据区有什么区别？**

JMM 是并发内存模型，关注线程间共享变量的可见性和重排序；JVM 运行时数据区是虚拟机内存结构，关注堆、栈、方法区等区域划分。

**`volatile` 和 `synchronized` 的区别？**

`volatile` 主要保证可见性和有序性，不保证复合操作原子性；`synchronized` 同时保证原子性、可见性和有序性。

**什么是 happens-before？**

它是 JMM 定义的可见性关系。A happens-before B，表示 A 的执行结果对 B 可见。

---

## 10. 总结

JMM 的核心是理解：多线程之间不是天然共享最新变量值，编译器和 CPU 也可能重排序。`volatile`、`synchronized`、`final`、线程启动和结束等规则，都是为了建立明确的可见性和有序性边界。
