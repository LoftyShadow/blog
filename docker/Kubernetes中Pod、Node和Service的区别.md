# Kubernetes 中 Pod、Node 和 Service 的区别

## 概述

在 Kubernetes 中，Pod、Node 和 Service 是三个核心概念，它们各自承担不同的职责，共同构成了 Kubernetes 的容器编排体系。

## 一、Node（节点）

### 定义

Node 是 Kubernetes 集群中的**物理机或虚拟机**，是集群的**计算资源提供者**。

### 特点

- **硬件层面**：Node 是实际的服务器（物理机或虚拟机）
- **资源提供者**：提供 CPU、内存、存储等计算资源
- **运行环境**：Pod 运行的宿主机
- **集群组成**：多个 Node 组成 Kubernetes 集群

### Node 的类型

| 类型 | 说明 | 职责 |
|------|------|------|
| **Master Node** | 控制平面节点 | 管理集群、调度 Pod、存储集群状态 |
| **Worker Node** | 工作节点 | 运行实际的应用 Pod |

### Node 的组件

```
Worker Node 组件：
├── kubelet        # 管理 Pod 生命周期
├── kube-proxy     # 管理网络规则
├── Container Runtime  # 容器运行时（Docker/containerd）
└── Pod            # 运行的 Pod 实例
```

### 查看 Node

```bash
# 查看所有节点
kubectl get nodes

# 查看节点详细信息
kubectl describe node <node-name>

# 查看节点资源使用情况
kubectl top nodes
```

### 示例输出

```
NAME           STATUS   ROLES           AGE   VERSION
master-node    Ready    control-plane   10d   v1.28.0
worker-node-1  Ready    <none>          10d   v1.28.0
worker-node-2  Ready    <none>          10d   v1.28.0
```

---

## 二、Pod（容器组）

### 定义

Pod 是 Kubernetes 中**最小的部署单元**，是**一组容器的集合**。

### 特点

- **容器组**：一个 Pod 可以包含一个或多个容器
- **共享资源**：Pod 内的容器共享网络命名空间和存储卷
- **原子性**：Pod 作为一个整体被调度、部署、删除
- **临时性**：Pod 是临时的，可以被随时创建和销毁
- **唯一 IP**：每个 Pod 有唯一的 IP 地址

### Pod 的生命周期

```
Pending → Running → Succeeded/Failed
   ↓         ↓
 调度中    运行中
```

| 状态 | 说明 |
|------|------|
| **Pending** | Pod 已创建，等待调度到 Node |
| **Running** | Pod 已绑定到 Node，容器正在运行 |
| **Succeeded** | Pod 中所有容器成功终止 |
| **Failed** | Pod 中至少有一个容器失败终止 |
| **Unknown** | 无法获取 Pod 状态 |

### Pod 的组成

```yaml
Pod:
├── 容器 1（主容器）
├── 容器 2（Sidecar 容器，可选）
├── 共享网络（localhost 通信）
└── 共享存储卷（Volume）
```

### Pod 示例

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: nginx
spec:
  containers:
  - name: nginx
    image: nginx:1.25
    ports:
    - containerPort: 80
```

### 查看 Pod

```bash
# 查看所有 Pod
kubectl get pods

# 查看 Pod 详细信息
kubectl describe pod <pod-name>

# 查看 Pod 日志
kubectl logs <pod-name>

# 进入 Pod 容器
kubectl exec -it <pod-name> -- /bin/bash
```

---

## 三、Service（服务）

### 定义

Service 是 Kubernetes 中的**网络抽象层**，为一组 Pod 提供**稳定的访问入口**。

### 为什么需要 Service？

**问题**：
- Pod 的 IP 地址是动态的，Pod 重启后 IP 会变化
- Pod 可能有多个副本，如何负载均衡？
- 如何从集群外部访问 Pod？

**解决方案**：
- Service 提供**稳定的虚拟 IP**（Cluster IP）
- Service 自动**负载均衡**到后端 Pod
- Service 提供**服务发现**机制

### Service 的类型

| 类型 | 说明 | 使用场景 |
|------|------|----------|
| **ClusterIP** | 集群内部访问（默认） | 微服务间通信 |
| **NodePort** | 通过节点端口访问 | 开发测试环境 |
| **LoadBalancer** | 云厂商负载均衡器 | 生产环境外部访问 |
| **ExternalName** | 映射到外部 DNS | 访问外部服务 |

### Service 工作原理

```
Client Request
    ↓
Service (Cluster IP: 10.96.0.10:80)
    ↓
负载均衡（kube-proxy）
    ↓
┌─────────┬─────────┬─────────┐
Pod 1     Pod 2     Pod 3
(10.1.1.1) (10.1.1.2) (10.1.1.3)
```

### Service 示例

#### 1. ClusterIP（集群内部访问）

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  type: ClusterIP  # 默认类型
  selector:
    app: nginx  # 选择标签为 app=nginx 的 Pod
  ports:
  - protocol: TCP
    port: 80        # Service 端口
    targetPort: 80  # Pod 端口
```

**访问方式**：
```bash
# 集群内部访问
curl http://nginx-service:80
```

#### 2. NodePort（节点端口访问）

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-nodeport
spec:
  type: NodePort
  selector:
    app: nginx
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
    nodePort: 30080  # 节点端口（30000-32767）
```

**访问方式**：
```bash
# 通过任意节点 IP + NodePort 访问
curl http://<node-ip>:30080
```

#### 3. LoadBalancer（负载均衡器）

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-lb
spec:
  type: LoadBalancer
  selector:
    app: nginx
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
```

**访问方式**：
```bash
# 通过云厂商分配的外部 IP 访问
curl http://<external-ip>:80
```

### 查看 Service

```bash
# 查看所有 Service
kubectl get services
kubectl get svc

# 查看 Service 详细信息
kubectl describe service <service-name>

# 查看 Service 的 Endpoints（后端 Pod）
kubectl get endpoints <service-name>
```

---

## 四、三者关系对比

### 关系图

```
┌─────────────────────────────────────────┐
│           Kubernetes Cluster            │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │         Node (物理机/虚拟机)      │   │
│  │                                 │   │
│  │  ┌─────────────────────────┐   │   │
│  │  │   Pod (容器组)           │   │   │
│  │  │  ┌──────────────────┐   │   │   │
│  │  │  │  Container 1     │   │   │   │
│  │  │  └──────────────────┘   │   │   │
│  │  │  ┌──────────────────┐   │   │   │
│  │  │  │  Container 2     │   │   │   │
│  │  │  └──────────────────┘   │   │   │
│  │  └─────────────────────────┘   │   │
│  │           ↑                     │   │
│  └───────────┼─────────────────────┘   │
│              │                         │
│  ┌───────────┼─────────────────────┐   │
│  │   Service (网络抽象)             │   │
│  │   - Cluster IP: 10.96.0.10     │   │
│  │   - 负载均衡到后端 Pod           │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 对比表

| 维度 | Node | Pod | Service |
|------|------|-----|---------|
| **层级** | 硬件层 | 应用层 | 网络层 |
| **定义** | 物理机/虚拟机 | 容器组 | 网络抽象 |
| **职责** | 提供计算资源 | 运行应用容器 | 提供稳定访问入口 |
| **生命周期** | 长期存在 | 临时的，可随时销毁 | 长期存在 |
| **IP 地址** | 节点 IP（固定） | Pod IP（动态） | Cluster IP（固定） |
| **数量关系** | 1 个 Node 运行多个 Pod | 1 个 Pod 包含多个容器 | 1 个 Service 对应多个 Pod |
| **可见性** | 集群管理员关注 | 开发者关注 | 开发者关注 |

### 类比理解

| Kubernetes | 现实世界类比 |
|------------|-------------|
| **Node** | 办公楼（提供场地） |
| **Pod** | 办公室（工作单元） |
| **Service** | 前台接待（统一入口） |

**场景**：
- **Node**：办公楼提供场地、电力、网络等基础设施
- **Pod**：办公室里有员工（容器）在工作
- **Service**：前台接待统一接待访客，然后分配到不同办公室

---

## 五、完整示例：部署 Nginx 应用

### 1. 创建 Deployment（管理 Pod）

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 3  # 创建 3 个 Pod 副本
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.25
        ports:
        - containerPort: 80
```

### 2. 创建 Service（暴露 Pod）

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  type: NodePort
  selector:
    app: nginx  # 选择标签为 app=nginx 的 Pod
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
    nodePort: 30080
```

### 3. 部署应用

```bash
# 应用配置
kubectl apply -f nginx-deployment.yaml
kubectl apply -f nginx-service.yaml

# 查看部署结果
kubectl get nodes
kubectl get pods
kubectl get services

# 访问应用
curl http://<node-ip>:30080
```

### 4. 查看完整信息

```bash
# 查看 Pod 运行在哪个 Node 上
kubectl get pods -o wide

# 输出示例：
NAME                               READY   STATUS    NODE
nginx-deployment-7d6b8c9f8-abc12   1/1     Running   worker-node-1
nginx-deployment-7d6b8c9f8-def34   1/1     Running   worker-node-2
nginx-deployment-7d6b8c9f8-ghi56   1/1     Running   worker-node-1

# 查看 Service 的 Endpoints（后端 Pod）
kubectl get endpoints nginx-service

# 输出示例：
NAME            ENDPOINTS
nginx-service   10.1.1.1:80,10.1.1.2:80,10.1.1.3:80
```

---

## 六、常见问题

### Q1: Pod 和容器的区别？

| 维度 | 容器 | Pod |
|------|------|-----|
| **定义** | 单个应用进程 | 一组容器的集合 |
| **网络** | 独立网络命名空间 | 共享网络命名空间 |
| **存储** | 独立存储 | 可共享存储卷 |
| **调度** | 不能单独调度 | Kubernetes 调度单元 |

**示例**：
```yaml
# 一个 Pod 包含多个容器（Sidecar 模式）
apiVersion: v1
kind: Pod
metadata:
  name: app-with-sidecar
spec:
  containers:
  - name: app          # 主容器
    image: myapp:1.0
  - name: log-agent    # Sidecar 容器（收集日志）
    image: fluentd:1.0
```

### Q2: 为什么 Pod 重启后 IP 会变？

- Pod 是**临时的**，重启后会被分配新的 IP
- 这就是为什么需要 **Service** 提供稳定的访问入口

### Q3: Service 如何找到后端 Pod？

通过 **Label Selector**（标签选择器）：

```yaml
# Service 配置
selector:
  app: nginx  # 选择标签为 app=nginx 的 Pod

# Pod 配置
metadata:
  labels:
    app: nginx  # Pod 的标签
```

### Q4: 一个 Node 可以运行多少个 Pod？

取决于：
- Node 的资源（CPU、内存）
- Pod 的资源请求（requests）
- 默认限制：每个 Node 最多 110 个 Pod（可配置）

### Q5: Service 的 Cluster IP 是什么？

- **虚拟 IP**：不是真实的网络接口
- **稳定不变**：Service 删除前不会改变
- **集群内可访问**：只能在集群内部访问（除非是 NodePort/LoadBalancer）

---

## 七、最佳实践

### 1. Node 管理

```bash
# 标记节点为不可调度（维护时）
kubectl cordon <node-name>

# 驱逐节点上的 Pod（维护前）
kubectl drain <node-name> --ignore-daemonsets

# 恢复节点调度
kubectl uncordon <node-name>
```

### 2. Pod 设计

- ✅ **单一职责**：一个 Pod 运行一个主应用
- ✅ **资源限制**：设置 requests 和 limits
- ✅ **健康检查**：配置 livenessProbe 和 readinessProbe
- ✅ **优雅终止**：处理 SIGTERM 信号

```yaml
spec:
  containers:
  - name: app
    image: myapp:1.0
    resources:
      requests:
        memory: "128Mi"
        cpu: "100m"
      limits:
        memory: "256Mi"
        cpu: "200m"
    livenessProbe:
      httpGet:
        path: /health
        port: 8080
      initialDelaySeconds: 30
      periodSeconds: 10
```

### 3. Service 设计

- ✅ **使用 ClusterIP**：微服务间通信
- ✅ **使用 NodePort**：开发测试环境
- ✅ **使用 LoadBalancer**：生产环境外部访问
- ✅ **配置会话亲和性**：需要时使用 sessionAffinity

```yaml
spec:
  sessionAffinity: ClientIP  # 同一客户端请求路由到同一 Pod
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 10800
```

---

## 八、总结

### 核心要点

1. **Node**：硬件层，提供计算资源
2. **Pod**：应用层，运行容器
3. **Service**：网络层，提供稳定访问

### 记忆口诀

```
Node 是地基（硬件资源）
Pod 是房子（应用容器）
Service 是门牌号（稳定入口）
```

### 工作流程

```
1. 集群管理员添加 Node（提供资源）
   ↓
2. 开发者创建 Deployment（定义 Pod）
   ↓
3. Kubernetes 调度 Pod 到 Node 上运行
   ↓
4. 创建 Service 暴露 Pod（提供访问入口）
   ↓
5. 客户端通过 Service 访问应用
```

### 下一步学习

- **Deployment**：管理 Pod 的副本和更新
- **ConfigMap/Secret**：管理配置和敏感信息
- **Ingress**：HTTP/HTTPS 路由
- **StatefulSet**：有状态应用管理
- **DaemonSet**：每个 Node 运行一个 Pod

---

## 参考资料

- [Kubernetes 官方文档 - Pods](https://kubernetes.io/docs/concepts/workloads/pods/)
- [Kubernetes 官方文档 - Nodes](https://kubernetes.io/docs/concepts/architecture/nodes/)
- [Kubernetes 官方文档 - Services](https://kubernetes.io/docs/concepts/services-networking/service/)
