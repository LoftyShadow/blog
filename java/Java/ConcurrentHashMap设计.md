`ConcurrentHashMap` 是 `java.util.concurrent` 包下的一个关键并发容器，旨在提供比 `Hashtable` 和 `Collections.synchronizedMap` 更高的并发性能。要透彻理解它，我们需要把它分为两个主要的历史版本来分析：JDK 1.7 及之前的实现 和 JDK 1.8 及之后的实现，因为两者在设计哲学和内部结构上有着天壤之别。

---

### 1. JDK 1.7 及之前的实现：分段锁（Segment Locking）

在早期的 Java 版本中，`ConcurrentHashMap` 通过一种叫做“分段锁”或“锁分离”的技术来实现高并发。这种设计的核心思想是，将一个大的哈希表分割成多个小的、独立的哈希表（即 `Segment`），每个 `Segment` 都有自己独立的锁。

#### **数据结构**

*   **`ConcurrentHashMap`** 内部包含一个 `Segment` 数组。
*   每个 **`Segment`** 继承自 `ReentrantLock`，它本身就像一个迷你的 `HashMap`，包含一个 `HashEntry` 数组。
*   每个 **`HashEntry`** 是一个链表节点，用于处理哈希冲突。

可以把它想象成一个两级结构：第一级是 `Segment` 数组，第二级是每个 `Segment` 内部的 `HashEntry` 数组。

!ConcurrentHashMap Java 7 an 8 [<sup>1</sup>](https://lh3.googleusercontent.com/proxy/4B68gK0G2Vb_Gg3zO92zFz1yq6iFeyD8Wz2y7T2kY0z2hS3Fk7H_5A6jX6Z9r1e1u7k_7t7f4r9b4e5Z4k3J2Q)

#### **并发控制原理**

*   **写操作（如 `put`, `remove`）**：
    1.  通过对键（key）的哈希值进行计算，定位到它应该属于哪个 `Segment`。
    2.  对该 `Segment` **加锁**。
    3.  在 `Segment` 内部执行类似于 `HashMap` 的 `put` 操作。
    4.  操作完成后，**解锁**该 `Segment`。

    由于锁只作用于单个 `Segment`，不同 `Segment` 之间的写操作可以并发执行，互不影响。默认情况下，`Segment` 的数量是 16，这意味着理论上最多可以支持 16 个线程同时进行写操作。

*   **读操作（如 `get`）**：
    `get` 操作通常**不需要加锁**。这是因为 `Segment` 内部的 `HashEntry` 数组和链表中的节点值都使用了 `volatile` 关键字修饰。这确保了在一个线程中对共享变量的修改对其他线程是可见的。只要能读到最新的值，就可以在不加锁的情况下完成操作，极大地提高了读取效率。

*   **`size()` 操作的挑战**：
    计算集合大小的 `size()` 操作比较复杂。因为在计算过程中，其他线程可能仍在并发地插入或删除元素。JDK 1.7 的实现采用了两种策略：
    1.  **无锁尝试**：首先，不加锁地尝试累加所有 `Segment` 的 `count` 值三次。如果在两次计算之间，所有 `Segment` 的 `modCount` (修改次数)都没有变化，就认为结果是准确的。
    2.  **全量加锁**：如果无锁尝试失败，则会依次锁住所有的 `Segment`，然后计算总大小，最后再解锁所有 `Segment`。这是一种后备方案，性能开销较大。

#### **优点与缺点**

*   **优点**：相比于对整个 `Map` 加锁的 `Hashtable`，分段锁极大地提高了并发度。
*   **缺点**：
    *   **固定的并发级别**：`Segment` 的数量在初始化后就不能改变，这限制了并发能力的动态扩展。
    *   **内存开销**：每个 `Segment` 都是一个独立的数据结构，相比 `HashMap`，内存开销更大。
    *   **`size()` 操作复杂且可能低效**：在并发写操作频繁时，计算大小的成本很高。

---

### 2. JDK 1.8 及之后的实现：CAS + Synchronized + 红黑树

从 Java 8 开始，`ConcurrentHashMap` 的实现被完全重写，摒弃了 `Segment` 的设计，采用了与 `HashMap` 在 Java 8 中类似的结构，即**数组 + 链表 + 红黑树**。 并发控制的粒度也从段级别（`Segment`）细化到了节点级别（数组的每个桶）。

#### **数据结构**

*   底层是一个 `Node` 数组（`table`），`Node` 是键值对的封装。
*   当哈希冲突发生时，相同哈希值的 `Node` 会以链表的形式存放在同一个数组桶（bucket）中。
*   当链表的长度超过一定阈值（默认为 8）且数组总长度大于 64 时，该链表会转化为**红黑树**，以优化查询性能，将时间复杂度从 O(n) 降低到 O(log n)。

#### **并发控制原理**

并发控制是 Java 8 实现的精髓，它巧妙地结合了**CAS（Compare-And-Swap）** 和 **`synchronized`** 关键字。

*   **`put` 操作**：
    1.  **初始化数组**：如果 `table` 尚未初始化，则通过 `CAS` 操作进行初始化，保证只有一个线程能成功初始化。
    2.  **定位桶位置**：根据 key 的哈希值计算出在数组中的索引。
    3.  **插入或更新节点**：
        *   **如果该位置为 null**：使用 `CAS` 操作尝试将新节点直接放入该位置。如果 `CAS` 成功，操作完成；如果失败（说明有其他线程抢先了），则进入下一步的自旋重试。
        *   **如果该位置不为 null**：说明发生了哈希冲突。此时，会使用 **`synchronized` 锁住该桶的头节点**（链表的第一个节点或红黑树的根节点）。
        *   在锁定的代码块内，遍历链表或红黑树，判断 key 是否已存在。如果存在，则更新 value；如果不存在，则将新节点插入到链表末尾或红黑树中。

    这种设计将锁的粒度降到了最低。只有在发生哈希冲突时，才需要对单个桶的头节点加锁。不同的桶之间完全可以并发操作，并发度远超 Java 7 的固定 16。

*   **`get` 操作**：
    `get` 操作同样是无锁的。由于 `Node` 数组被 `volatile` 修饰，并且 `Node` 节点的 `val` 和 `next` 指针也是 `volatile` 的，因此可以保证读操作总能获取到最新的数据，无需同步。

*   **`size()` 操作**：
    Java 8 对 `size()` 的计算也做了优化。它维护了一个 `baseCount` 变量，并通过一个 `CounterCell` 数组来辅助计数。
    *   在没有并发竞争时，直接通过 `CAS` 更新 `baseCount`。
    *   当 `CAS` 更新 `baseCount` 失败时（说明存在竞争），会将计数值通过 `CAS` 操作累加到 `CounterCell` 数组的某个槽位中。
    *   最终的 `size` 就是 `baseCount` 和所有 `CounterCell` 中值的总和。这种设计分散了计数的压力，是一种高并发的原子计数实现，类似于 `LongAdder`。

#### **为什么从 ReentrantLock 换成 synchronized？**

这是一个常见的问题。在 Java 8 中，`synchronized` 锁得到了显著的性能优化，包括锁膨胀、锁消除等。在锁的粒度已经非常细（只锁头节点）的情况下，`synchronized` 的性能并不比 `ReentrantLock` 差，甚至JVM的内置优化使其在某些场景下表现更好。 此外，`synchronized` 的代码更简洁，不易出错。

---

### **总结：Java 7 vs Java 8**

| 特性 | JDK 1.7 实现 | JDK 1.8 实现 |
| :--- | :--- | :--- |
| **底层结构** | Segment 数组 + HashEntry 链表 | Node 数组 + 链表/红黑树 |
| **锁机制** | 分段锁 (ReentrantLock) | CAS + Synchronized |
| **锁粒度** | Segment 级别（一个段包含多个桶） | 桶级别（数组的单个槽位） |
| **并发度** | 固定（默认 16） | 动态，理论上是数组长度 |
| **`size()` 计算** | 尝试无锁累加，失败后全量加锁 | 基于 CAS 的 `LongAdder` 思想，分而治之 |
| **哈希冲突** | 始终为链表 | 链表长度过长时转为红黑树 |

总而言之，`ConcurrentHashMap` 的演进体现了并发编程设计的巨大进步。从 Java 7 的分段锁到 Java 8 的 CAS + `synchronized`，锁的粒度变得越来越细，极大地减少了线程间的竞争，从而在现代多核处理器上实现了更高的吞吐量和更好的伸缩性。这是每一位 Java 开发者都应该深入理解的经典并发容器设计。

## `ConcurrentHashMap` 和 `HashMap` 的区别

`ConcurrentHashMap` 和 `HashMap` 最根本、最本质的区别就在于：

*   **`HashMap` 是非线程安全的。**
*   **`ConcurrentHashMap` 是线程安全的。**

由这个根本区别，衍生出了一系列内部实现上的巨大差异，你提到的 `synchronized` 锁头节点只是其中之一。

---

### `ConcurrentHashMap` vs `HashMap` 核心区别对比 (基于 JDK 1.8+)

| 特性 | HashMap | ConcurrentHashMap (JDK 1.8+) | 解释 |
| :--- | :--- | :--- | :--- |
| **1. 线程安全** | **非线程安全** | **线程安全** | 这是最根本的区别。在多线程环境下对 `HashMap` 进行写操作会导致数据不一致，甚至在扩容时引发死循环。 |
| **2. 锁机制** | **无锁** | **CAS + Synchronized** | `HashMap` 不考虑并发，所以没有任何锁。`ConcurrentHashMap` 在写入时，首先尝试用无锁的 CAS 操作写入空桶，只有当发生哈希冲突时，才用 `synchronized` 锁住该桶的头节点，实现了极细粒度的锁定。 |
| **3. Null 支持** | **允许** key 和 value 为 `null` | **不允许** key 和 value 为 `null` | 这是为了避免二义性。在并发场景下，`get(key)` 返回 `null` 无法确定是“值本就是 null”还是“这个 key 不存在”。`ConcurrentHashMap` 通过禁止 null 来确保 `get()` 返回 `null` 只有一个含义：key 不存在。 |
| **4. 性能** | 单线程下**更快** | 多线程下**性能极高** | `HashMap` 因为没有同步开销（如 volatile 读写、CAS、锁），在单线程环境下速度最快。`ConcurrentHashMap` 在多线程环境下，由于其精巧的并发设计，吞吐量远超粗暴地对整个 map 加锁的 `Hashtable` 或 `Collections.synchronizedMap`。 |
| **5. 迭代器 (Iterator)** | **Fail-Fast** (快速失败) | **Weakly Consistent** (弱一致性) | `HashMap` 的迭代器在迭代过程中如果发现集合被修改，会立即抛出 `ConcurrentModificationException`。而 `ConcurrentHashMap` 的迭代器不会抛出此异常，它能容忍并发修改，但不保证能反映出迭代器创建之后的所有修改。 |
| **6. 扩容机制** | 单线程扩容 | **并发扩容** | `HashMap` 在扩容时，由单个线程完成所有数据迁移。在并发下，这可能导致数据丢失或死循环。`ConcurrentHashMap` 的扩容是一个非常精巧的设计，它允许**多个线程协同完成数据迁移**，线程在操作时如果发现 map 正在扩容，会主动帮助迁移一小部分数据，极大地提高了扩容效率。 |

---

### 总结与补充

“`ConcurrentHashMap` 与 `HashMap` 最大的区别在于前者是线程安全的。为了在保证线程安全的同时最大化并发性能，`ConcurrentHashMap` 在 JDK 1.8 之后采用了非常精巧的设计。例如，在执行 `put` 操作时，如果目标位置为空，它会使用无锁的 CAS 操作来添加节点；如果发生哈希冲突，它才会使用 `synchronized` 锁住链表或红黑树的头节点，将锁的粒度控制在单个桶级别，而不是像 `Hashtable` 那样锁住整个表。除此之外，它在扩容、计数、迭代器等方面也都有专门的并发设计来确保安全和高效。”
