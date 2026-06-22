# MySQL 事务和 MVCC

理解 MySQL 事务时，可以围绕 ACID、隔离级别、MVCC、undo log、ReadView、快照读、当前读、间隙锁、临键锁和死锁排查展开。

---

## 1. ACID

事务四大特性：

| 特性 | 含义 |
| :--- | :--- |
| Atomicity 原子性 | 事务中的操作要么全部成功，要么全部失败 |
| Consistency 一致性 | 事务执行前后数据满足约束 |
| Isolation 隔离性 | 并发事务之间互不干扰的程度 |
| Durability 持久性 | 事务提交后数据持久保存 |

---

## 2. 隔离级别

MySQL 常见隔离级别：

| 隔离级别 | 脏读 | 不可重复读 | 幻读 |
| :--- | :--- | :--- | :--- |
| Read Uncommitted | 可能 | 可能 | 可能 |
| Read Committed | 不会 | 可能 | 可能 |
| Repeatable Read | 不会 | 不会 | 一般快照读不会 |
| Serializable | 不会 | 不会 | 不会 |

InnoDB 默认隔离级别是 `Repeatable Read`。

---

## 3. 三类读问题

### 3.1 脏读

读到了其他事务未提交的数据。

### 3.2 不可重复读

同一事务内，两次读取同一行，结果不同。通常是其他事务修改并提交导致。

### 3.3 幻读

同一事务内，两次范围查询，结果行数不同。通常是其他事务插入或删除符合条件的数据导致。

---

## 4. MVCC 是什么

MVCC 是多版本并发控制。

它通过保存数据的多个版本，让读写尽量不互相阻塞。

核心依赖：

*   隐藏事务 ID。
*   回滚指针。
*   undo log。
*   ReadView。

---

## 5. undo log

undo log 主要有两个作用：

*   事务回滚时恢复旧值。
*   MVCC 快照读时构造历史版本。

当一行记录被多次修改，会通过回滚指针形成版本链：

```text
最新记录 -> undo 版本 1 -> undo 版本 2 -> ...
```

快照读会根据 ReadView 判断哪个版本可见。

---

## 6. ReadView

ReadView 是快照读的一致性视图。

它大致包含：

| 字段 | 含义 |
| :--- | :--- |
| `m_ids` | 创建 ReadView 时活跃事务 ID 列表 |
| `min_trx_id` | 活跃事务中最小事务 ID |
| `max_trx_id` | 下一个将要分配的事务 ID |
| `creator_trx_id` | 创建该 ReadView 的事务 ID |

可见性判断简化理解：

*   版本事务 ID 小于 `min_trx_id`：已提交，可见。
*   版本事务 ID 大于等于 `max_trx_id`：创建 ReadView 后才出现，不可见。
*   版本事务 ID 在活跃事务列表中：未提交，不可见。
*   版本事务 ID 不在活跃事务列表中：已提交，可见。

---

## 7. RC 和 RR 下 ReadView 差异

| 隔离级别 | ReadView 创建时机 |
| :--- | :--- |
| Read Committed | 每次快照读都创建新的 ReadView |
| Repeatable Read | 第一次快照读创建 ReadView，事务内复用 |

所以 RC 下同一事务内两次查询可能看到不同提交结果；RR 下快照读通常能保持一致。

---

## 8. 快照读和当前读

### 8.1 快照读

普通 `select` 通常是快照读：

```sql
select * from user where id = 1;
```

它通过 MVCC 读取历史版本，不加锁。

### 8.2 当前读

当前读读取最新版本，并且通常会加锁：

```sql
select * from user where id = 1 for update;
select * from user where id = 1 lock in share mode;
update user set name = 'a' where id = 1;
delete from user where id = 1;
```

当前读需要看到最新数据，所以不能只依赖快照。

---

## 9. Record Lock、Gap Lock、Next-Key Lock

| 锁 | 含义 |
| :--- | :--- |
| Record Lock | 锁住索引记录 |
| Gap Lock | 锁住索引记录之间的间隙 |
| Next-Key Lock | Record Lock + Gap Lock |

Next-Key Lock 用于防止幻读，本质是锁住记录和它前面的间隙。

注意：InnoDB 行锁是加在索引上的。如果查询没有命中索引，可能扫描更多记录，锁范围会扩大。

---

## 10. 死锁排查

查看最近一次死锁：

```sql
show engine innodb status;
```

常见原因：

*   多事务加锁顺序不一致。
*   范围更新锁住大量记录。
*   索引缺失导致锁范围扩大。
*   大事务持锁时间太长。

优化思路：

*   保持加锁顺序一致。
*   补充合适索引。
*   缩小事务范围。
*   避免大事务。
*   失败后重试。

---

## 11. 理解检查

**MVCC 能解决幻读吗？**

快照读场景下，RR 通过复用 ReadView 避免幻读现象。当前读场景下，需要依赖 Next-Key Lock 防止其他事务插入新的匹配记录。

**为什么 InnoDB 默认是 RR？**

RR 配合 MVCC 能提供较好的一致性读体验，同时并发性能比 Serializable 更好。

**当前读为什么要加锁？**

当前读要读取最新数据，并且后续可能修改，所以需要通过锁防止并发冲突。

---

## 12. 总结

MVCC 通过 undo log 和 ReadView 实现一致性快照读，让读写尽量不互相阻塞。锁机制负责当前读和写写冲突控制。理解 MySQL 事务要把 MVCC 和锁结合起来看。
