# MySQL 日志和主从复制

MySQL 日志体系是事务、崩溃恢复、主从复制和数据恢复的基础。理解重点包括 redo log、undo log、binlog、两阶段提交、主从复制流程和主从延迟。

---

## 1. 三类核心日志

| 日志 | 所属层 | 作用 |
| :--- | :--- | :--- |
| undo log | InnoDB | 回滚和 MVCC |
| redo log | InnoDB | 崩溃恢复 |
| binlog | Server 层 | 主从复制和数据恢复 |

---

## 2. undo log

undo log 记录数据修改前的旧版本。

作用：

*   事务回滚。
*   MVCC 构造历史版本。

例如：

```sql
update user set age = 20 where id = 1;
```

undo log 会记录修改前的值，事务回滚时可以恢复。

---

## 3. redo log

redo log 是物理日志，记录数据页做了什么修改。

作用：

*   保证事务持久性。
*   支持崩溃恢复。
*   把随机写转换为顺序写，提高性能。

事务提交时，不一定马上把脏页刷到磁盘数据文件，但 redo log 会按策略刷盘。宕机后可以通过 redo log 恢复已提交事务。

---

## 4. binlog

binlog 是 Server 层日志，记录逻辑变更。

作用：

*   主从复制。
*   数据恢复。
*   审计和增量同步。

常见格式：

| 格式 | 特点 |
| :--- | :--- |
| Statement | 记录 SQL，体积小，但可能有不确定性 |
| Row | 记录行变更，准确但体积大 |
| Mixed | 混合模式 |

现在生产中通常更推荐 Row 格式。

---

## 5. redo log 和 binlog 区别

| 对比点 | redo log | binlog |
| :--- | :--- | :--- |
| 所属 | InnoDB | Server 层 |
| 类型 | 物理日志 | 逻辑日志 |
| 作用 | 崩溃恢复 | 主从复制、数据恢复 |
| 写入方式 | 循环写 | 追加写 |
| 是否引擎特有 | 是 | 否 |

---

## 6. 两阶段提交

为了保证 redo log 和 binlog 一致，MySQL 使用两阶段提交。

简化流程：

```text
执行事务
  -> 写 redo log prepare
  -> 写 binlog
  -> 写 redo log commit
```

如果没有两阶段提交，可能出现：

*   redo log 有，binlog 没有。
*   binlog 有，redo log 没有。

这会导致主库和从库数据不一致，或者崩溃恢复后数据和 binlog 对不上。

---

## 7. 崩溃恢复判断

宕机恢复时：

*   redo log 只有 prepare，没有 binlog：回滚。
*   redo log prepare，binlog 完整：提交。
*   redo log 已 commit：提交。

核心是通过 binlog 和 redo log 的事务标识判断事务是否应该提交。

---

## 8. 主从复制流程

MySQL 主从复制简化流程：

```text
主库写入 binlog
  -> 从库 IO 线程拉取 binlog
  -> 写入 relay log
  -> 从库 SQL 线程重放 relay log
  -> 从库数据追上主库
```

复制默认是异步的，所以主库提交成功不代表从库已经同步完成。

---

## 9. 主从延迟

常见原因：

*   主库写入量太大。
*   从库 SQL 线程重放慢。
*   大事务。
*   从库机器性能差。
*   从库执行查询压力大。
*   网络延迟。

解决思路：

*   避免大事务。
*   开启并行复制。
*   从库扩容。
*   读写分离时对强一致读走主库。
*   监控复制延迟。

---

## 10. 数据恢复

常见恢复方式：

```text
全量备份 + binlog 增量恢复
```

流程：

```text
恢复最近一次全量备份
  -> 找到误操作前的 binlog 位点
  -> 重放 binlog 到指定时间点
```

误删数据后，不要立刻在原库上乱操作，应先保留现场和 binlog。

---

## 11. 理解检查

**redo log 和 binlog 为什么都需要？**

redo log 是 InnoDB 崩溃恢复需要的物理日志；binlog 是 Server 层用于主从复制和数据恢复的逻辑日志。二者作用不同。

**为什么需要两阶段提交？**

为了保证 redo log 和 binlog 的一致性，避免崩溃后主库恢复结果和从库复制结果不一致。

**主从复制是强一致吗？**

默认不是。复制通常是异步的，会存在主从延迟。

---

## 12. 总结

undo log 支持回滚和 MVCC，redo log 支持崩溃恢复，binlog 支持复制和恢复。两阶段提交保证 redo log 和 binlog 一致。主从复制基于 binlog，但默认异步，强一致读要谨慎走从库。
