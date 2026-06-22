# Redis 高可用和集群

理解 Redis 高可用时，可以围绕主从复制、哨兵、Cluster、故障转移、脑裂、slot 和集群扩容展开。

---

## 1. Redis 常见部署形态

| 形态 | 作用 | 问题 |
| :--- | :--- | :--- |
| 单机 | 简单部署 | 无高可用，容量有限 |
| 主从复制 | 读扩展，数据副本 | 主节点故障需要切换 |
| 哨兵 | 自动故障转移 | 不解决数据分片 |
| Cluster | 分片 + 高可用 | 客户端和运维复杂度更高 |

---

## 2. 主从复制

主从复制是指一个 master 节点把数据同步给一个或多个 replica 节点。

作用：

*   数据冗余。
*   读写分离。
*   故障恢复基础。

简化流程：

```text
replica 连接 master
  -> 发送同步请求
  -> master 生成 RDB 快照
  -> master 发送 RDB 给 replica
  -> replica 加载 RDB
  -> master 持续发送增量命令
```

---

## 3. 全量复制和增量复制

### 3.1 全量复制

从节点第一次同步，或者复制偏移量差距太大时，会触发全量复制。

缺点：

*   master 生成 RDB 有开销。
*   网络传输大文件。
*   replica 加载 RDB 期间可能阻塞。

### 3.2 增量复制

Redis 使用复制偏移量和复制积压缓冲区支持增量复制。

如果 replica 短暂断开后重新连接，只要缺失的数据还在积压缓冲区中，就可以只补缺失命令。

---

## 4. 哨兵 Sentinel

哨兵用于监控 Redis 主从节点，并在 master 故障时自动选举新 master。

核心职责：

*   监控节点是否存活。
*   发现 master 主观下线。
*   多个哨兵投票确认客观下线。
*   选择一个 replica 晋升为新 master。
*   通知其他 replica 改为复制新 master。
*   通知客户端新的 master 地址。

---

## 5. 主观下线和客观下线

| 概念 | 含义 |
| :--- | :--- |
| 主观下线 | 某个哨兵认为 master 不可用 |
| 客观下线 | 多个哨兵达成共识，确认 master 不可用 |

主观下线可能是网络抖动，客观下线通过投票降低误判概率。

---

## 6. 哨兵故障转移流程

简化流程：

```text
哨兵发现 master 不可达
  -> 达到 quorum 后标记客观下线
  -> 哨兵之间选举 leader
  -> leader 选择一个 replica 作为新 master
  -> 执行 slaveof no one
  -> 其他 replica 改为复制新 master
  -> 旧 master 恢复后变成 replica
```

选择 replica 时通常会考虑：

*   优先级。
*   复制偏移量。
*   run id。

---

## 7. Redis Cluster

Redis Cluster 同时解决：

*   数据分片。
*   高可用。
*   水平扩展。

Redis Cluster 把 key 空间划分为：

```text
16384 个 hash slot
```

每个 master 负责一部分 slot。

key 到 slot 的计算：

```text
CRC16(key) % 16384
```

---

## 8. Cluster 读写路由

客户端访问任意节点，如果 key 不属于当前节点，会收到重定向：

```text
MOVED slot targetHost:targetPort
```

迁移过程中可能收到：

```text
ASK slot targetHost:targetPort
```

区别：

*   `MOVED`：slot 已经迁移完成，客户端应更新路由缓存。
*   `ASK`：slot 正在迁移，客户端临时访问目标节点。

---

## 9. Cluster 故障转移

每个 master 通常有 replica。

当 master 故障时：

```text
其他节点检测到 master 不可达
  -> 达成故障共识
  -> 对应 replica 发起选举
  -> replica 晋升为 master
  -> 接管原 master 的 slot
```

如果某个 master 和它的 replica 都不可用，对应 slot 不可服务，整个集群可能进入不可用状态。

---

## 10. 脑裂问题

脑裂指网络分区时，旧 master 没有真正停止服务，新 master 又被选出来，导致出现两个 master 接收写入。

风险：

*   分区恢复后旧 master 可能被降级。
*   旧 master 上的写入可能丢失。

缓解方式：

*   合理配置 `min-replicas-to-write`。
*   合理配置 `min-replicas-max-lag`。
*   客户端只写当前主节点。
*   对关键写入做业务幂等和持久化兜底。

---

## 11. 理解检查

**主从复制是强一致吗？**

不是。Redis 主从复制默认是异步复制，master 写成功后 replica 可能还没同步。

**哨兵和 Cluster 的区别？**

哨兵主要解决主从高可用，不做数据分片；Cluster 同时支持分片和高可用。

**Redis Cluster 为什么是 16384 个 slot？**

slot 数量固定可以简化数据迁移和路由管理。每个节点负责一部分 slot，扩容时迁移 slot 即可。

---

## 12. 总结

Redis 高可用可以按层次理解：主从复制提供副本，哨兵提供自动故障转移，Cluster 提供分片和高可用。还要注意 Redis 默认异步复制，不保证强一致，关键业务需要额外兜底。
