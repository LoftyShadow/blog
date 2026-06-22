# JVM 运行时数据区和 OOM 排查

理解 JVM 运行时数据区时，要把内存区域、GC、OOM 和线上排查放在一起看。只有知道每个内存区域负责什么，才能判断不同异常对应的根因。

---

## 1. JVM 运行时数据区

常见运行时数据区：

```text
线程私有：
  - 程序计数器
  - Java 虚拟机栈
  - 本地方法栈

线程共享：
  - Java 堆
  - 方法区 / 元空间
  - 运行时常量池
  - 直接内存
```

---

## 2. 程序计数器

程序计数器记录当前线程正在执行的字节码行号。

特点：

*   线程私有。
*   占用内存很小。
*   是 JVM 规范中唯一没有规定 `OutOfMemoryError` 的区域。

---

## 3. Java 虚拟机栈

每个线程都有自己的虚拟机栈。每次方法调用都会创建一个栈帧。

栈帧中包含：

*   局部变量表。
*   操作数栈。
*   动态链接。
*   方法返回地址。

常见异常：

| 异常 | 原因 |
| :--- | :--- |
| `StackOverflowError` | 栈深度过深，例如无限递归 |
| `OutOfMemoryError: unable to create new native thread` | 线程太多，无法创建新线程 |

---

## 4. Java 堆

堆是对象实例主要分配区域，也是 GC 管理的核心区域。

常见异常：

```text
java.lang.OutOfMemoryError: Java heap space
```

常见原因：

*   对象创建速度太快。
*   大对象占用内存。
*   集合持续增长。
*   缓存没有淘汰。
*   内存泄漏导致对象无法回收。

---

## 5. 方法区 / 元空间

JDK 8 之后，方法区的实现从永久代变成元空间，元空间使用本地内存。

主要存放：

*   类元信息。
*   方法信息。
*   字段信息。
*   常量池相关信息。
*   JIT 编译后的代码缓存。

常见异常：

```text
java.lang.OutOfMemoryError: Metaspace
```

常见原因：

*   动态生成大量类。
*   CGLIB、动态代理使用不当。
*   类加载器泄漏。
*   热部署频繁导致旧类无法卸载。

---

## 6. 直接内存

直接内存不属于 Java 堆，但会占用进程内存。

常见使用方：

*   NIO `DirectByteBuffer`。
*   Netty。
*   文件传输和零拷贝。

常见异常：

```text
java.lang.OutOfMemoryError: Direct buffer memory
```

排查时不能只看堆，还要看进程 RSS、直接内存和本地内存。

---

## 7. 常见 OOM 类型

| 异常 | 典型原因 |
| :--- | :--- |
| `Java heap space` | 堆对象过多或泄漏 |
| `GC overhead limit exceeded` | GC 花费大量时间但回收很少 |
| `Metaspace` | 类元信息过多或类加载器泄漏 |
| `Direct buffer memory` | 直接内存不足 |
| `unable to create new native thread` | 线程数过多或系统资源不足 |
| `Requested array size exceeds VM limit` | 数组过大 |

---

## 8. OOM 排查流程

建议流程：

```text
确认异常类型
  -> 保留现场日志和 dump
  -> 看 JVM 参数和内存限制
  -> 用 jstat 看 GC 情况
  -> 用 jmap 导出堆
  -> 用 MAT / JProfiler / VisualVM 分析大对象和引用链
  -> 定位代码中的持有方
```

常用参数：

```bash
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/path/to/dump
-XX:+PrintGCDetails
```

JDK 9+ 常用统一日志：

```bash
-Xlog:gc*:file=gc.log:time,uptime,level,tags
```

---

## 9. CPU 飙高排查

流程：

```text
top 找到 Java 进程
top -Hp <pid> 找到高 CPU 线程
printf "%x\n" <tid> 转成十六进制
jstack <pid> 找到对应 nid
分析线程栈
```

常见原因：

*   死循环。
*   正则回溯。
*   频繁 GC。
*   锁竞争严重。
*   线程池任务堆积。

---

## 10. 频繁 Full GC 排查

关注点：

*   老年代是否持续增长。
*   Full GC 后内存是否明显下降。
*   是否有大对象直接进入老年代。
*   是否存在内存泄漏。
*   元空间是否持续增长。

如果 Full GC 后内存下降明显，可能是分配压力大或参数不合理。

如果 Full GC 后内存下降很少，通常要怀疑内存泄漏或长期存活对象过多。

---

## 11. 理解检查

**堆和栈的区别？**

堆用于存放对象实例，线程共享，由 GC 管理；栈用于方法调用，线程私有，方法结束后栈帧出栈。

**元空间为什么还会 OOM？**

元空间使用本地内存，不代表无限。动态类太多、类加载器泄漏、元空间上限太小都会导致 OOM。

**`jmap` 和 `jstack` 分别看什么？**

`jmap` 主要看堆对象和 dump；`jstack` 看线程栈、死锁、阻塞和 CPU 飙高线程。

---

## 12. 总结

OOM 排查不能只记命令。先判断异常对应的内存区域，再结合 GC 日志、线程栈、堆 dump 和 JVM 参数定位。真正要掌握的是“区域 -> 现象 -> 工具 -> 根因”的链路。
