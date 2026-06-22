# Elasticsearch 核心原理

理解 Elasticsearch 时，可以围绕倒排索引、分片副本、写入流程、查询流程、refresh、segment merge、深分页和 `term`/`match` 区别展开。

---

## 1. ES 是什么

Elasticsearch 是基于 Lucene 的分布式搜索和分析引擎。

适合：

*   全文检索。
*   日志检索。
*   聚合分析。
*   多条件复杂查询。

不适合：

*   强事务系统。
*   高频更新的核心账务数据。
*   替代关系型数据库做强一致存储。

---

## 2. 倒排索引

关系型数据库常用正向索引：

```text
文档 -> 包含哪些词
```

搜索引擎核心是倒排索引：

```text
词 -> 出现在哪些文档
```

例如：

```text
doc1: Java 并发 编程
doc2: Java 虚拟机
doc3: Redis 缓存
```

倒排索引：

```text
Java -> doc1, doc2
并发 -> doc1
Redis -> doc3
```

这样搜索某个词时，可以快速定位文档列表。

---

## 3. 分词

全文检索字段会经过分词器处理。

分词器通常包含：

```text
character filter -> tokenizer -> token filter
```

中文搜索通常需要 IK、jieba 等中文分词方案。

---

## 4. index、shard、replica

| 概念 | 含义 |
| :--- | :--- |
| index | 类似逻辑表 |
| document | 一条文档 |
| field | 文档字段 |
| shard | 主分片，承载部分数据 |
| replica | 副本分片，提供高可用和读扩展 |

一个 index 可以拆成多个 primary shard，每个 primary shard 可以有多个 replica。

---

## 5. 写入流程

简化流程：

```text
客户端写入文档
  -> 协调节点根据路由找到 primary shard
  -> primary shard 写入内存 buffer 和 translog
  -> 转发给 replica shard
  -> replica 写入成功
  -> 返回客户端
```

写入后不是立刻能被搜索到，要等 refresh。

---

## 6. refresh、flush、merge

### 6.1 refresh

refresh 会把内存 buffer 中的数据生成新的 segment，并让它对搜索可见。

ES 近实时搜索的原因就是 refresh 不是每次写入都执行，而是周期性执行。

### 6.2 flush

flush 会把内存中的数据更彻底地持久化，并生成 commit point，同时清理 translog。

### 6.3 merge

Lucene segment 是不可变的。频繁 refresh 会产生很多小 segment。

merge 会把多个小 segment 合并成大 segment，并清理已删除文档。

代价：

*   消耗 CPU。
*   消耗磁盘 IO。
*   可能影响写入和查询性能。

---

## 7. 查询流程

ES 查询通常分两个阶段：

```text
query phase
fetch phase
```

### 7.1 query phase

协调节点把查询请求转发给相关 shard。每个 shard 本地查询并返回 top N 文档 ID 和排序信息。

### 7.2 fetch phase

协调节点合并排序结果后，再去对应 shard 拉取完整文档内容。

---

## 8. term 和 match

| 查询 | 特点 | 场景 |
| :--- | :--- | :--- |
| `term` | 不分词，精确匹配倒排词项 | keyword、状态码、枚举值 |
| `match` | 会对查询内容分词 | text 全文检索 |

如果对 `text` 字段用 `term` 查询，容易查不到，因为索引时已经分词。

如果对 `keyword` 字段用 `match`，通常也能查，但语义上不如 `term` 精确。

---

## 9. 深分页问题

普通分页：

```json
{
  "from": 10000,
  "size": 10
}
```

深分页代价很高，因为每个 shard 都要取大量候选结果，协调节点再合并排序。

解决方式：

*   限制最大分页深度。
*   使用 `search_after`。
*   使用 point in time（PIT）保证翻页期间视图稳定。
*   业务上避免跳到特别深的页。

---

## 10. 为什么 ES 是近实时

写入文档后，数据先进入内存 buffer 和 translog。只有 refresh 后，新 segment 被打开，数据才对搜索可见。

因此 ES 不是严格实时，而是近实时。

---

## 11. 理解检查

**ES 为什么查询快？**

核心是倒排索引，可以从词快速定位文档集合，而不是逐行扫描。

**refresh 和 flush 区别？**

refresh 让数据对搜索可见；flush 更偏持久化和 translog 清理。

**为什么深分页慢？**

因为每个 shard 都要构造大量排序结果，协调节点再合并，内存和 CPU 成本高。

**为什么写入太频繁会影响查询？**

频繁写入和 refresh 会产生大量 segment，merge 又会消耗 IO 和 CPU。

---

## 12. 总结

ES 的核心链路是：倒排索引用于快速检索，分片副本用于分布式扩展和高可用，refresh 带来近实时搜索，segment merge 影响写入和查询性能。理解时要避免把 ES 当成普通数据库。
