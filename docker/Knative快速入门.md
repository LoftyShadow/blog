# Knative 快速入门

## 什么是 Knative？

Knative 是一个基于 Kubernetes 的开源平台，用于构建、部署和管理现代化的 Serverless 工作负载。它简化了在 Kubernetes 上运行无服务器应用的复杂性。

**核心优势**：
- 🚀 自动扩缩容（包括缩容到零）
- 📦 简化的部署模型
- 🔄 流量管理和灰度发布
- 🎯 事件驱动架构
- 💰 按需计费（缩容到零节省资源）
- 🔧 开发者友好的体验

---

## 核心概念

### 1. Knative 架构

```
┌─────────────────────────────────────────────────┐
│                  Knative 平台                    │
├─────────────────────────────────────────────────┤
│  Knative Serving (服务管理)                      │
│  ┌──────────────────────────────────────────┐  │
│  │ Service → Route → Configuration          │  │
│  │              ↓                            │  │
│  │           Revision (版本)                 │  │
│  └──────────────────────────────────────────┘  │
├─────────────────────────────────────────────────┤
│  Knative Eventing (事件驱动)                     │
│  ┌──────────────────────────────────────────┐  │
│  │ Event Source → Broker → Trigger          │  │
│  │                    ↓                      │  │
│  │                 Service                   │  │
│  └──────────────────────────────────────────┘  │
├─────────────────────────────────────────────────┤
│              Kubernetes 集群                     │
└─────────────────────────────────────────────────┘
```

### 2. 核心组件

| 组件 | 说明 | 作用 |
|------|------|------|
| **Knative Serving** | 服务管理 | 部署和运行无服务器容器 |
| **Knative Eventing** | 事件系统 | 事件驱动架构支持 |
| **Service** | 服务抽象 | 管理应用的整个生命周期 |
| **Route** | 路由 | 流量路由和版本管理 |
| **Configuration** | 配置 | 定义服务的期望状态 |
| **Revision** | 版本 | 代码和配置的不可变快照 |

### 3. Knative vs Kubernetes

| 特性 | Kubernetes | Knative |
|------|------------|---------|
| **部署复杂度** | 需要 Deployment、Service、Ingress 等 | 只需一个 Service 资源 |
| **自动扩缩容** | 需要配置 HPA | 内置自动扩缩容（含缩容到零） |
| **流量管理** | 需要手动配置 | 内置流量分割和灰度发布 |
| **版本管理** | 手动管理 | 自动版本管理 |
| **适用场景** | 通用容器编排 | Serverless 和事件驱动应用 |

---

## 安装 Knative

### 前置条件

- Kubernetes 集群（1.28+）
- kubectl 命令行工具
- 至少 3GB 内存和 2 个 CPU 核心

### 方案 1: 使用 Minikube（本地学习）

**适用场景**：本地开发、学习测试

```bash
# 1. 启动 Minikube（需要足够的资源）
minikube start --cpus=4 --memory=8192 --driver=docker

# 2. 安装 Knative Serving
kubectl apply -f https://github.com/knative/serving/releases/download/knative-v1.12.0/serving-crds.yaml
kubectl apply -f https://github.com/knative/serving/releases/download/knative-v1.12.0/serving-core.yaml

# 3. 安装网络层（选择 Kourier）
kubectl apply -f https://github.com/knative/net-kourier/releases/download/knative-v1.12.0/kourier.yaml

# 4. 配置 Knative 使用 Kourier
kubectl patch configmap/config-network \
  --namespace knative-serving \
  --type merge \
  --patch '{"data":{"ingress-class":"kourier.ingress.networking.knative.dev"}}'

# 5. 配置 DNS（使用 Magic DNS）
kubectl apply -f https://github.com/knative/serving/releases/download/knative-v1.12.0/serving-default-domain.yaml

# 6. 验证安装
kubectl get pods -n knative-serving
kubectl get pods -n kourier-system
```

### 方案 2: 使用 Kind（Kubernetes in Docker）

**适用场景**：CI/CD、多集群测试

```bash
# 1. 创建 Kind 集群配置文件
cat <<EOF > kind-config.yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  extraPortMappings:
  - containerPort: 31080
    hostPort: 80
  - containerPort: 31443
    hostPort: 443
EOF

# 2. 创建集群
kind create cluster --config kind-config.yaml --name knative

# 3. 安装 Knative Serving（同 Minikube 步骤 2-6）
kubectl apply -f https://github.com/knative/serving/releases/download/knative-v1.12.0/serving-crds.yaml
kubectl apply -f https://github.com/knative/serving/releases/download/knative-v1.12.0/serving-core.yaml
kubectl apply -f https://github.com/knative/net-kourier/releases/download/knative-v1.12.0/kourier.yaml

kubectl patch configmap/config-network \
  --namespace knative-serving \
  --type merge \
  --patch '{"data":{"ingress-class":"kourier.ingress.networking.knative.dev"}}'

kubectl apply -f https://github.com/knative/serving/releases/download/knative-v1.12.0/serving-default-domain.yaml
```

### 方案 3: 使用 Knative CLI（推荐）

**适用场景**：快速安装和管理

```bash
# 1. 安装 Knative CLI (kn)
# Windows (Scoop)
scoop bucket add knative https://github.com/knative-sandbox/kn-plugin-quickstart
scoop install kn

# macOS
brew install knative/client/kn

# Linux
wget https://github.com/knative/client/releases/download/knative-v1.12.0/kn-linux-amd64
chmod +x kn-linux-amd64
sudo mv kn-linux-amd64 /usr/local/bin/kn

# 2. 使用 quickstart 插件快速安装
kn quickstart kind

# 或使用 Minikube
kn quickstart minikube

# 3. 验证安装
kn version
kubectl get pods -n knative-serving
```

### 验证安装

```bash
# 检查 Knative Serving 组件
kubectl get pods -n knative-serving

# 应该看到以下 Pod 运行中：
# - activator
# - autoscaler
# - controller
# - webhook
# - net-kourier-controller

# 检查 Kourier 网关
kubectl get pods -n kourier-system

# 获取 Kourier 服务地址
kubectl get svc kourier -n kourier-system
```

---

## Knative CLI (kn) 命令速查

### 安装 kn CLI

```bash
# Windows (Scoop)
scoop install kn

# macOS
brew install knative/client/kn

# Linux
wget https://github.com/knative/client/releases/download/knative-v1.12.0/kn-linux-amd64
chmod +x kn-linux-amd64
sudo mv kn-linux-amd64 /usr/local/bin/kn

# 验证安装
kn version
```

### 常用命令速查

```bash
# ========== 服务管理 ==========
kn service list                   # 查看所有服务
kn service describe <name>        # 查看服务详情
kn service create <name> --image <image>  # 创建服务
kn service update <name> --image <image>  # 更新服务
kn service delete <name>          # 删除服务

# ========== 版本管理 ==========
kn revision list                  # 查看所有版本
kn revision describe <name>       # 查看版本详情
kn revision delete <name>         # 删除版本

# ========== 路由管理 ==========
kn route list                     # 查看路由
kn route describe <name>          # 查看路由详情

# ========== 流量管理 ==========
kn service update <name> \
  --traffic <revision>=<percent>  # 设置流量分配

# ========== 域名管理 ==========
kn domain list                    # 查看域名
kn domain create <domain> --ref <service>  # 创建域名映射

# ========== 日志查看 ==========
kn service logs <name>            # 查看服务日志
kn service logs <name> -f         # 实时查看日志
```

---

## 第一个应用：部署 Hello World

### 方式 1: 使用 kn CLI（推荐）

```bash
# 1. 创建服务
kn service create hello \
  --image gcr.io/knative-samples/helloworld-go \
  --port 8080 \
  --env TARGET=World

# 2. 查看服务状态
kn service list

# 输出示例：
# NAME    URL                                        LATEST        AGE   CONDITIONS   READY
# hello   http://hello.default.1.2.3.4.sslip.io      hello-00001   10s   3 OK / 3     True

# 3. 访问服务
curl http://hello.default.1.2.3.4.sslip.io

# 输出：Hello World!

# 4. 查看服务详情
kn service describe hello

# 5. 查看 Pod（等待一段时间后会自动缩容到零）
kubectl get pods

# 6. 再次访问（会自动扩容）
curl http://hello.default.1.2.3.4.sslip.io
```

### 方式 2: 使用 YAML 文件

创建文件 `hello-service.yaml`：

```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: hello
spec:
  template:
    metadata:
      annotations:
        # 自动扩缩容配置
        autoscaling.knative.dev/min-scale: "0"
        autoscaling.knative.dev/max-scale: "10"
        autoscaling.knative.dev/target: "10"
    spec:
      containers:
      - image: gcr.io/knative-samples/helloworld-go
        ports:
        - containerPort: 8080
        env:
        - name: TARGET
          value: "World"
        resources:
          requests:
            memory: "64Mi"
            cpu: "100m"
          limits:
            memory: "128Mi"
            cpu: "200m"
```

部署应用：

```bash
# 应用配置
kubectl apply -f hello-service.yaml

# 查看服务
kubectl get ksvc

# 查看详细信息
kubectl get ksvc hello -o yaml

# 获取服务 URL
kubectl get ksvc hello -o jsonpath='{.status.url}'

# 访问服务
curl $(kubectl get ksvc hello -o jsonpath='{.status.url}')
```

### 观察自动扩缩容

```bash
# 1. 查看初始 Pod（可能没有）
kubectl get pods

# 2. 发送请求触发扩容
curl http://hello.default.1.2.3.4.sslip.io

# 3. 立即查看 Pod（会看到 Pod 启动）
kubectl get pods -w

# 4. 等待 60 秒（默认缩容时间）
# Pod 会自动缩容到零

# 5. 使用 hey 工具进行压力测试
# 安装 hey
go install github.com/rakyll/hey@latest

# 发送 1000 个请求
hey -z 30s -c 50 http://hello.default.1.2.3.4.sslip.io

# 观察 Pod 自动扩容
kubectl get pods -w
```

---

## 服务更新和版本管理

### 1. 更新服务

```bash
# 方式 1: 使用 kn CLI 更新环境变量
kn service update hello --env TARGET=Knative

# 方式 2: 更新镜像
kn service update hello --image gcr.io/knative-samples/helloworld-go:v2

# 方式 3: 更新资源限制
kn service update hello \
  --request memory=128Mi \
  --limit memory=256Mi

# 查看更新后的服务
kn service describe hello
```

### 2. 查看版本历史

```bash
# 查看所有版本
kn revision list

# 输出示例：
# NAME          SERVICE   TRAFFIC   TAGS   GENERATION   AGE
# hello-00002   hello     100%             2            1m
# hello-00001   hello                      1            10m

# 查看特定版本详情
kn revision describe hello-00001
```

### 3. 流量分割（金丝雀发布）

```bash
# 将 50% 流量路由到新版本，50% 到旧版本
kn service update hello \
  --traffic hello-00001=50 \
  --traffic hello-00002=50

# 查看流量分配
kn service describe hello

# 逐步增加新版本流量
kn service update hello \
  --traffic hello-00001=20 \
  --traffic hello-00002=80

# 完全切换到新版本
kn service update hello \
  --traffic hello-00002=100

# 或使用 @latest 标签
kn service update hello --traffic @latest=100
```

### 4. 版本标签

```bash
# 为版本添加标签
kn service update hello \
  --tag hello-00001=stable \
  --tag hello-00002=candidate

# 使用标签访问特定版本
curl http://stable-hello.default.1.2.3.4.sslip.io
curl http://candidate-hello.default.1.2.3.4.sslip.io

# 基于标签的流量分配
kn service update hello \
  --traffic stable=90 \
  --traffic candidate=10
```

### 5. 回滚

```bash
# 回滚到上一个版本
kn service update hello --traffic hello-00001=100

# 或使用 kubectl
kubectl rollout undo ksvc/hello
```

---

## 自动扩缩容配置

### 1. 基本配置

```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: autoscale-demo
spec:
  template:
    metadata:
      annotations:
        # 最小副本数（0 表示可以缩容到零）
        autoscaling.knative.dev/min-scale: "0"

        # 最大副本数
        autoscaling.knative.dev/max-scale: "10"

        # 目标并发数（每个 Pod 处理的并发请求数）
        autoscaling.knative.dev/target: "10"

        # 扩缩容窗口（稳定窗口）
        autoscaling.knative.dev/window: "60s"

        # 缩容到零的等待时间
        autoscaling.knative.dev/scale-down-delay: "30s"
    spec:
      containers:
      - image: gcr.io/knative-samples/autoscale-go:0.0.1
```

### 2. 扩缩容指标

```bash
# 基于并发数（默认）
kn service create concurrent-demo \
  --image gcr.io/knative-samples/autoscale-go:0.0.1 \
  --annotation autoscaling.knative.dev/metric=concurrency \
  --annotation autoscaling.knative.dev/target=10

# 基于 RPS（每秒请求数）
kn service create rps-demo \
  --image gcr.io/knative-samples/autoscale-go:0.0.1 \
  --annotation autoscaling.knative.dev/metric=rps \
  --annotation autoscaling.knative.dev/target=100

# 基于 CPU 使用率
kn service create cpu-demo \
  --image gcr.io/knative-samples/autoscale-go:0.0.1 \
  --annotation autoscaling.knative.dev/metric=cpu \
  --annotation autoscaling.knative.dev/target=80
```

### 3. 禁用缩容到零

```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: always-running
spec:
  template:
    metadata:
      annotations:
        # 最小保持 1 个副本
        autoscaling.knative.dev/min-scale: "1"
        autoscaling.knative.dev/max-scale: "10"
    spec:
      containers:
      - image: nginx:latest
```

### 4. 全局配置

```bash
# 编辑全局配置
kubectl edit configmap config-autoscaler -n knative-serving

# 常用配置项：
# - scale-to-zero-grace-period: 缩容到零的宽限期（默认 30s）
# - stable-window: 稳定窗口（默认 60s）
# - target-burst-capacity: 突发容量（默认 200）
```

---

## Knative Eventing 事件驱动

### 1. 安装 Knative Eventing

```bash
# 安装 Eventing CRDs
kubectl apply -f https://github.com/knative/eventing/releases/download/knative-v1.12.0/eventing-crds.yaml

# 安装 Eventing 核心组件
kubectl apply -f https://github.com/knative/eventing/releases/download/knative-v1.12.0/eventing-core.yaml

# 安装内存中的 Channel 实现
kubectl apply -f https://github.com/knative/eventing/releases/download/knative-v1.12.0/in-memory-channel.yaml

# 安装 Broker 实现
kubectl apply -f https://github.com/knative/eventing/releases/download/knative-v1.12.0/mt-channel-broker.yaml

# 验证安装
kubectl get pods -n knative-eventing
```

### 2. 事件源（Event Source）

**创建 PingSource（定时事件源）**

```yaml
apiVersion: sources.knative.dev/v1
kind: PingSource
metadata:
  name: ping-source
spec:
  schedule: "*/1 * * * *"  # 每分钟触发一次
  contentType: "application/json"
  data: '{"message": "Hello from PingSource!"}'
  sink:
    ref:
      apiVersion: serving.knative.dev/v1
      kind: Service
      name: event-display
```

**创建事件接收服务**

```bash
# 创建一个简单的事件显示服务
kn service create event-display \
  --image gcr.io/knative-releases/knative.dev/eventing/cmd/event_display

# 应用 PingSource
kubectl apply -f ping-source.yaml

# 查看日志
kubectl logs -l serving.knative.dev/service=event-display -c user-container -f
```

### 3. Broker 和 Trigger

**创建 Broker**

```yaml
apiVersion: eventing.knative.dev/v1
kind: Broker
metadata:
  name: default
  namespace: default
```

或使用命令：

```bash
# 为命名空间启用默认 Broker
kubectl label namespace default knative-eventing-injection=enabled

# 查看 Broker
kubectl get broker
```

**创建 Trigger（事件过滤和路由）**

```yaml
apiVersion: eventing.knative.dev/v1
kind: Trigger
metadata:
  name: my-trigger
spec:
  broker: default
  filter:
    attributes:
      type: dev.knative.samples.helloworld
      source: dev.knative.samples/helloworldsource
  subscriber:
    ref:
      apiVersion: serving.knative.dev/v1
      kind: Service
      name: event-display
```

### 4. 发送事件到 Broker

```bash
# 获取 Broker URL
BROKER_URL=$(kubectl get broker default -o jsonpath='{.status.address.url}')

# 发送事件
curl -v "$BROKER_URL" \
  -X POST \
  -H "Ce-Id: 1234" \
  -H "Ce-Specversion: 1.0" \
  -H "Ce-Type: dev.knative.samples.helloworld" \
  -H "Ce-Source: dev.knative.samples/helloworldsource" \
  -H "Content-Type: application/json" \
  -d '{"msg":"Hello Knative!"}'

# 查看事件接收日志
kubectl logs -l serving.knative.dev/service=event-display -c user-container -f
```

---

## 实战案例：部署微服务应用

### 场景：部署前后端分离应用

**1. 部署后端 API 服务**

```bash
# 创建后端服务
kn service create backend-api \
  --image gcr.io/knative-samples/helloworld-go \
  --port 8080 \
  --env TARGET=Backend \
  --annotation autoscaling.knative.dev/min-scale=1 \
  --annotation autoscaling.knative.dev/max-scale=5

# 获取后端 URL
BACKEND_URL=$(kn service describe backend-api -o url)
echo $BACKEND_URL
```

**2. 部署前端服务**

```bash
# 创建前端服务
kn service create frontend \
  --image nginx:alpine \
  --port 80 \
  --env BACKEND_URL=$BACKEND_URL \
  --annotation autoscaling.knative.dev/min-scale=1

# 获取前端 URL
kn service describe frontend -o url
```

**3. 配置流量分割（蓝绿部署）**

```bash
# 更新后端服务（新版本）
kn service update backend-api \
  --image gcr.io/knative-samples/helloworld-go:v2 \
  --env TARGET=Backend-V2

# 查看版本
kn revision list -s backend-api

# 配置流量：90% 到旧版本，10% 到新版本
kn service update backend-api \
  --traffic backend-api-00001=90 \
  --traffic backend-api-00002=10

# 逐步切换流量
kn service update backend-api \
  --traffic backend-api-00001=50 \
  --traffic backend-api-00002=50

# 完全切换到新版本
kn service update backend-api \
  --traffic @latest=100
```

---

## 高级特性

### 1. 私有镜像仓库

```bash
# 创建 Docker 凭证 Secret
kubectl create secret docker-registry regcred \
  --docker-server=<your-registry-server> \
  --docker-username=<your-username> \
  --docker-password=<your-password> \
  --docker-email=<your-email>

# 在服务中使用
kn service create private-app \
  --image your-registry.com/your-image:tag \
  --pull-secret regcred
```

或使用 YAML：

```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: private-app
spec:
  template:
    spec:
      imagePullSecrets:
      - name: regcred
      containers:
      - image: your-registry.com/your-image:tag
```

### 2. 环境变量和配置

```bash
# 从 ConfigMap 注入环境变量
kubectl create configmap app-config \
  --from-literal=DATABASE_URL=postgres://localhost:5432/mydb

kn service create myapp \
  --image myapp:latest \
  --env-from configmap:app-config

# 从 Secret 注入环境变量
kubectl create secret generic db-secret \
  --from-literal=DB_PASSWORD=secret123

kn service create myapp \
  --image myapp:latest \
  --env DB_PASSWORD=secretKeyRef:db-secret:DB_PASSWORD
```

### 3. 持久化存储

```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: storage-app
spec:
  template:
    spec:
      containers:
      - image: myapp:latest
        volumeMounts:
        - name: data
          mountPath: /data
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: my-pvc
```

### 4. 健康检查

```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: health-check-app
spec:
  template:
    spec:
      containers:
      - image: myapp:latest
        ports:
        - containerPort: 8080
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 3
```

### 5. 自定义域名

```bash
# 方式 1: 使用 kn CLI
kn domain create myapp.example.com --ref myapp

# 方式 2: 使用 YAML
cat <<EOF | kubectl apply -f -
apiVersion: serving.knative.dev/v1alpha1
kind: DomainMapping
metadata:
  name: myapp.example.com
spec:
  ref:
    name: myapp
    kind: Service
    apiVersion: serving.knative.dev/v1
EOF

# 配置 DNS
# 将 myapp.example.com 的 CNAME 记录指向 Knative Ingress Gateway
```

---

## 最佳实践

### 1. 资源管理

```yaml
# ✅ 始终设置资源请求和限制
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: resource-demo
spec:
  template:
    spec:
      containers:
      - image: myapp:latest
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
```

### 2. 合理配置扩缩容

```bash
# ✅ 根据业务场景配置
# 高流量服务：保持最小副本数
kn service create high-traffic \
  --image myapp:latest \
  --annotation autoscaling.knative.dev/min-scale=2 \
  --annotation autoscaling.knative.dev/max-scale=20

# 低频服务：允许缩容到零
kn service create low-traffic \
  --image myapp:latest \
  --annotation autoscaling.knative.dev/min-scale=0 \
  --annotation autoscaling.knative.dev/max-scale=5
```

### 3. 使用标签和注解

```yaml
# ✅ 添加有意义的标签和注解
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: myapp
  labels:
    app: myapp
    version: v1.0
    env: prod
    team: backend
  annotations:
    description: "Backend API service"
    owner: "backend-team@example.com"
spec:
  template:
    metadata:
      labels:
        app: myapp
        version: v1.0
```

### 4. 健康检查配置

```yaml
# ✅ 配置合适的健康检查
spec:
  template:
    spec:
      containers:
      - image: myapp:latest
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 2
```

### 5. 使用命名空间隔离

```bash
# ✅ 按环境隔离
kubectl create namespace dev
kubectl create namespace staging
kubectl create namespace prod

# 在指定命名空间部署
kn service create myapp \
  --image myapp:latest \
  --namespace prod
```

### 6. 版本管理策略

```bash
# ✅ 使用语义化版本标签
kn service update myapp \
  --tag myapp-00001=v1.0.0 \
  --tag myapp-00002=v1.1.0 \
  --tag @latest=latest

# 生产环境使用稳定版本
kn service update myapp \
  --traffic v1.0.0=100
```

---

## 常见问题排查

### 1. 服务无法访问

```bash
# 检查服务状态
kn service list
kubectl get ksvc

# 查看服务详情
kn service describe <service-name>

# 检查 Pod 状态
kubectl get pods

# 查看 Pod 日志
kubectl logs <pod-name> -c user-container

# 常见原因：
# - 镜像拉取失败 (ImagePullBackOff)
# - 容器启动失败 (CrashLoopBackOff)
# - 健康检查失败
# - 资源不足
```

### 2. 自动扩缩容不工作

```bash
# 检查 Autoscaler 配置
kubectl get configmap config-autoscaler -n knative-serving -o yaml

# 查看 Revision 的扩缩容配置
kubectl get revision <revision-name> -o yaml

# 检查 Metrics
kubectl get hpa

# 查看 Autoscaler 日志
kubectl logs -n knative-serving -l app=autoscaler
```

### 3. 流量分割不生效

```bash
# 查看 Route 配置
kubectl get route <service-name> -o yaml

# 检查 Revision 状态
kn revision list

# 查看流量分配
kn service describe <service-name>

# 验证流量分配
for i in {1..10}; do curl <service-url>; done
```

### 4. 事件未触发

```bash
# 检查 Broker 状态
kubectl get broker

# 查看 Trigger 配置
kubectl get trigger

# 检查事件源
kubectl get pingsource
kubectl get containersource

# 查看事件日志
kubectl logs -l eventing.knative.dev/broker=default
```

### 5. 性能问题

```bash
# 查看资源使用
kubectl top pods

# 检查扩缩容历史
kubectl describe hpa

# 查看 Revision 指标
kubectl get revision <revision-name> -o yaml

# 调整并发目标
kn service update <service-name> \
  --annotation autoscaling.knative.dev/target=20
```

---

## 监控和日志

### 1. 查看服务日志

```bash
# 使用 kn CLI
kn service logs <service-name>
kn service logs <service-name> -f

# 使用 kubectl
kubectl logs -l serving.knative.dev/service=<service-name> -c user-container

# 查看特定 Revision 日志
kubectl logs -l serving.knative.dev/revision=<revision-name> -c user-container -f
```

### 2. 查看指标

```bash
# 查看服务状态
kn service list

# 查看 Revision 详情
kn revision describe <revision-name>

# 查看 Pod 资源使用
kubectl top pods

# 查看 HPA 状态
kubectl get hpa
```

### 3. 集成 Prometheus 和 Grafana

```bash
# 安装 Prometheus
kubectl apply -f https://github.com/knative/serving/releases/download/knative-v1.12.0/monitoring-metrics-prometheus.yaml

# 访问 Grafana
kubectl port-forward -n knative-monitoring \
  $(kubectl get pods -n knative-monitoring -l app=grafana -o name) \
  3000:3000

# 浏览器访问: http://localhost:3000
```

---

## 实用技巧

### 1. 快速生成 YAML

```bash
# 生成服务 YAML（不创建）
kn service create myapp \
  --image myapp:latest \
  --dry-run \
  -o yaml > service.yaml

# 导出现有服务配置
kn service describe myapp -o yaml > myapp.yaml
```

### 2. 批量操作

```bash
# 删除所有服务
kn service delete --all

# 删除特定标签的服务
kubectl delete ksvc -l app=myapp

# 批量更新镜像
for svc in $(kn service list -o name); do
  kn service update $svc --image myapp:v2
done
```

### 3. 使用别名

```bash
# 添加到 ~/.bashrc 或 ~/.zshrc
alias k='kubectl'
alias kn='kn'
alias kns='kn service'
alias knsl='kn service list'
alias knsd='kn service describe'
alias knr='kn revision'
```

### 4. 本地开发调试

```bash
# 端口转发到本地
kubectl port-forward \
  $(kubectl get pod -l serving.knative.dev/service=myapp -o name) \
  8080:8080

# 使用 kn func 进行本地开发
kn func create -l go myfunction
kn func run
kn func deploy
```

---

## 学习路径建议

### 初级阶段（1-2 周）

1. **理解核心概念**
   - Knative Serving 基础
   - Service、Revision、Route
   - 自动扩缩容原理
   - 与 Kubernetes 的关系

2. **本地环境搭建**
   - 安装 Minikube 或 Kind
   - 安装 Knative Serving
   - 熟悉 kn CLI 命令
   - 部署第一个应用

3. **实践项目**
   - 部署 Hello World 应用
   - 观察自动扩缩容
   - 尝试流量分割
   - 配置环境变量

### 中级阶段（2-4 周）

1. **深入学习**
   - 自动扩缩容配置优化
   - 流量管理和灰度发布
   - 版本管理策略
   - 健康检查配置
   - 资源限制和优化

2. **事件驱动**
   - 安装 Knative Eventing
   - 理解 Broker 和 Trigger
   - 配置事件源
   - 实现事件驱动架构

3. **实践项目**
   - 部署微服务应用
   - 实现蓝绿部署
   - 配置事件驱动工作流
   - 集成监控和日志

### 高级阶段（1-2 月）

1. **进阶主题**
   - 自定义域名配置
   - 私有镜像仓库集成
   - 高级扩缩容策略
   - 性能优化和调优
   - 安全最佳实践

2. **生产实践**
   - 多环境部署策略
   - CI/CD 集成
   - 监控和告警
   - 故障排查和恢复
   - 成本优化

3. **实践项目**
   - 构建完整的 Serverless 应用
   - 实现复杂的事件驱动架构
   - 集成 Prometheus 和 Grafana
   - 实现多租户隔离

---

## 学习资源

### 官方文档

- **Knative 官方文档**: https://knative.dev/docs/
- **Knative GitHub**: https://github.com/knative
- **Knative CLI 文档**: https://github.com/knative/client/blob/main/docs/README.md
- **Knative 博客**: https://knative.dev/blog/

### 在线教程

- **Knative 官方教程**: https://knative.dev/docs/getting-started/
- **Red Hat Knative 教程**: https://redhat-developer-demos.github.io/knative-tutorial/
- **Google Cloud Run 文档**: https://cloud.google.com/run/docs

### 书籍推荐

- 《Knative in Action》
- 《Knative Cookbook》
- 《Serverless Applications with Knative》

### 视频课程

- Knative 官方 YouTube 频道
- CNCF Knative 相关视频
- KubeCon 上的 Knative 演讲

### 实践平台

- **Minikube**: 本地单节点集群
- **Kind**: Docker 中的 Kubernetes
- **Google Cloud Run**: 托管的 Knative 服务
- **Red Hat OpenShift Serverless**: 企业级 Knative

### 社区资源

- **Knative Slack**: https://slack.knative.dev/
- **Knative 邮件列表**: https://groups.google.com/g/knative-users
- **Stack Overflow**: 标签 `knative`

---

## 快速参考卡片

### kn CLI 命令速记

```bash
# 服务管理
kn service create <name> --image <image>
kn service list
kn service describe <name>
kn service update <name> --image <image>
kn service delete <name>

# 版本管理
kn revision list
kn revision describe <name>
kn revision delete <name>

# 流量管理
kn service update <name> --traffic <rev>=<percent>
kn service update <name> --tag <rev>=<tag>

# 路由管理
kn route list
kn route describe <name>

# 日志查看
kn service logs <name>
kn service logs <name> -f
```

### kubectl 资源缩写

| 完整名称 | 缩写 | 说明 |
|----------|------|------|
| services.serving.knative.dev | ksvc | Knative Service |
| revisions.serving.knative.dev | rev | Knative Revision |
| routes.serving.knative.dev | rt | Knative Route |
| configurations.serving.knative.dev | cfg | Knative Configuration |

### 常用注解

```yaml
# 自动扩缩容
autoscaling.knative.dev/min-scale: "0"
autoscaling.knative.dev/max-scale: "10"
autoscaling.knative.dev/target: "10"
autoscaling.knative.dev/metric: "concurrency"
autoscaling.knative.dev/window: "60s"
autoscaling.knative.dev/scale-down-delay: "30s"

# 其他
serving.knative.dev/visibility: "cluster-local"  # 集群内部访问
```

---

## Knative vs 其他 Serverless 平台

### 对比表格

| 特性 | Knative | AWS Lambda | Azure Functions | Google Cloud Run |
|------|---------|------------|-----------------|------------------|
| **部署位置** | 任何 K8s 集群 | AWS 云 | Azure 云 | GCP 云 |
| **供应商锁定** | 无 | 高 | 高 | 中（基于 Knative） |
| **容器支持** | 完全支持 | 有限 | 有限 | 完全支持 |
| **自动扩缩容** | 是（含缩容到零） | 是 | 是 | 是（含缩容到零） |
| **冷启动时间** | 中等 | 快 | 快 | 快 |
| **流量分割** | 内置 | 需配置 | 需配置 | 内置 |
| **事件驱动** | Knative Eventing | EventBridge | Event Grid | Eventarc |
| **本地开发** | 完全支持 | 模拟器 | 模拟器 | 本地容器 |
| **成本** | 基础设施成本 | 按调用计费 | 按调用计费 | 按调用计费 |

### 选择建议

**选择 Knative 的场景**：
- ✅ 需要避免供应商锁定
- ✅ 已有 Kubernetes 集群
- ✅ 需要混合云/多云部署
- ✅ 需要完全控制基础设施
- ✅ 容器化应用迁移

**选择云服务商 Serverless 的场景**：
- ✅ 快速启动，无需管理基础设施
- ✅ 深度集成云服务商生态
- ✅ 小型项目或原型验证
- ✅ 按需付费模式

---

## 总结

### 核心要点回顾

1. **Knative 是什么**
   - 基于 Kubernetes 的 Serverless 平台
   - 简化容器化应用的部署和管理
   - 提供自动扩缩容和流量管理
   - 支持事件驱动架构

2. **核心优势**
   - **自动扩缩容**：根据流量自动调整副本数，支持缩容到零
   - **简化部署**：一个 Service 资源即可完成部署
   - **流量管理**：内置流量分割，支持蓝绿部署和金丝雀发布
   - **版本管理**：自动管理版本，支持快速回滚
   - **事件驱动**：通过 Eventing 支持复杂的事件驱动架构
   - **开放标准**：避免供应商锁定，可在任何 K8s 集群运行

3. **核心组件**
   - **Knative Serving**：管理无服务器工作负载
   - **Knative Eventing**：事件驱动架构支持
   - **Service**：应用的抽象表示
   - **Revision**：代码和配置的不可变快照
   - **Route**：流量路由和版本管理

4. **学习建议**
   - 先掌握 Kubernetes 基础知识
   - 从本地环境开始（Minikube/Kind）
   - 动手实践比理论更重要
   - 先掌握 Serving，再学习 Eventing
   - 多看官方文档和示例

5. **下一步**
   - 部署自己的应用到 Knative
   - 尝试流量分割和灰度发布
   - 探索 Knative Eventing
   - 集成 CI/CD 流程
   - 学习生产环境最佳实践

### 常见误区

- ❌ Knative 不是 Kubernetes 的替代品（它是基于 K8s 的扩展）
- ❌ Knative 不仅仅是 FaaS（它支持任何容器化应用）
- ❌ 缩容到零不适合所有场景（高频访问服务应保持最小副本数）
- ❌ Knative 不会自动解决所有问题（需要正确配置和优化）
- ❌ 学习曲线存在，但比直接使用 K8s 简单很多

### 适用场景

**✅ 适合使用 Knative**：
- 微服务应用
- API 服务
- Webhook 处理
- 定时任务
- 事件驱动应用
- 流量波动大的应用
- 需要快速迭代的应用

**❌ 不适合使用 Knative**：
- 有状态应用（数据库等）
- 长时间运行的任务
- 需要持久化连接的应用
- 对冷启动时间敏感的应用
- 资源密集型计算任务

### 最后的话

Knative 是云原生 Serverless 的重要技术，它将 Kubernetes 的强大能力与 Serverless 的简洁性完美结合。通过 Knative，你可以：

- 🚀 **快速部署**：几行命令即可部署应用
- 💰 **节省成本**：自动缩容到零，按需使用资源
- 🔄 **灵活管理**：内置流量分割和版本管理
- 🎯 **事件驱动**：轻松构建事件驱动架构
- 🌐 **避免锁定**：可在任何 K8s 集群运行

**记住这些原则**：
- 📚 多看官方文档和示例
- 💻 多动手实践，从简单开始
- 🤝 参与社区，学习最佳实践
- 🔄 持续学习，关注新特性
- 🎯 根据场景选择合适的配置

**开始你的 Knative 之旅**：
1. 搭建本地环境（Minikube + Knative）
2. 部署第一个 Hello World 应用
3. 观察自动扩缩容的魔力
4. 尝试流量分割和灰度发布
5. 探索事件驱动架构

祝你学习愉快！🚀

---

**文档版本**: v1.0
**最后更新**: 2026-01-17
**作者**: Claude Code
**许可**: MIT License

---

## 附录：常见问题 FAQ

### Q1: Knative 和 Kubernetes 有什么区别？

**A**: Knative 是基于 Kubernetes 的扩展，不是替代品。Kubernetes 提供容器编排的基础能力，而 Knative 在此基础上提供了 Serverless 抽象，简化了部署、自动扩缩容和流量管理。

### Q2: Knative 是否支持缩容到零？

**A**: 是的，这是 Knative 的核心特性之一。当没有流量时，Knative 会自动将副本数缩减到零，节省资源。当有新请求到来时，会自动扩容。

### Q3: 冷启动时间有多长？

**A**: 冷启动时间取决于容器镜像大小和应用启动时间，通常在几秒到十几秒之间。可以通过优化镜像大小、使用健康检查、设置最小副本数等方式减少冷启动影响。

### Q4: Knative 适合生产环境吗？

**A**: 是的，Knative 已经在许多生产环境中使用，包括 Google Cloud Run（基于 Knative）、Red Hat OpenShift Serverless 等。但需要注意正确配置和监控。

### Q5: 如何处理有状态应用？

**A**: Knative 主要设计用于无状态应用。对于有状态应用，建议使用 Kubernetes 的 StatefulSet，或将状态存储在外部服务（数据库、对象存储等）。

### Q6: Knative 的性能开销有多大？

**A**: Knative 在 Kubernetes 之上增加了一些组件（Activator、Autoscaler 等），会有一定的性能开销，但对于大多数应用来说可以忽略不计。对于极高性能要求的场景，可以考虑直接使用 Kubernetes。

### Q7: 如何监控 Knative 应用？

**A**: Knative 支持 Prometheus 和 Grafana 集成，可以监控请求数、延迟、错误率、扩缩容事件等指标。也可以使用云服务商提供的监控工具。

### Q8: Knative 支持哪些编程语言？

**A**: Knative 支持任何可以容器化的应用，因此支持所有主流编程语言（Go、Java、Python、Node.js、.NET 等）。

### Q9: 如何从 AWS Lambda 迁移到 Knative？

**A**: 需要将 Lambda 函数容器化，然后部署到 Knative。可以使用 AWS Lambda Runtime API 兼容层，或重写为标准的 HTTP 服务。

### Q10: Knative 的学习曲线陡峭吗？

**A**: 如果已经熟悉 Kubernetes，学习 Knative 会比较容易。如果是新手，建议先学习 Kubernetes 基础，再学习 Knative。使用 kn CLI 可以大大降低学习难度。
