# Envoy Gateway 快速入门

## 简介

Envoy Gateway 是一个基于 Envoy Proxy 的开源 Kubernetes 原生 API 网关，它实现了 Kubernetes Gateway API 规范。Envoy Gateway 为微服务架构提供了强大的流量管理、安全性和可观测性功能。

## 核心概念

### Gateway API 资源

- **GatewayClass**: 定义一组共享相同配置的网关
- **Gateway**: 定义如何将流量转换到集群内的服务
- **HTTPRoute**: 定义 HTTP 流量的路由规则
- **TLSRoute**: 定义 TLS 流量的路由规则
- **TCPRoute**: 定义 TCP 流量的路由规则
- **UDPRoute**: 定义 UDP 流量的路由规则

## 安装 Envoy Gateway

### 前置条件

- Kubernetes 集群 (v1.25+)
- kubectl 命令行工具
- Helm 3.x (可选)

### 使用 Helm 安装

```bash
# 添加 Envoy Gateway Helm 仓库
helm repo add envoy-gateway https://gateway.envoyproxy.io/charts
helm repo update

# 安装 Envoy Gateway
helm install eg envoy-gateway/gateway-helm --create-namespace -n envoy-gateway-system
```

### 使用 YAML 安装

```bash
# 安装 Gateway API CRDs
kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.0.0/standard-install.yaml

# 安装 Envoy Gateway
kubectl apply -f https://github.com/envoyproxy/gateway/releases/download/latest/install.yaml
```

### 验证安装

```bash
# 检查 Envoy Gateway 组件状态
kubectl get pods -n envoy-gateway-system

# 检查 GatewayClass
kubectl get gatewayclass
```

## 快速开始示例

### 1. 创建 Gateway

创建一个 Gateway 资源来定义入口点：

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: eg-gateway
  namespace: default
spec:
  gatewayClassName: eg
  listeners:
  - name: http
    protocol: HTTP
    port: 80
```

应用配置：

```bash
kubectl apply -f gateway.yaml
```

### 2. 部署示例应用

```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend
  namespace: default
spec:
  selector:
    app: backend
  ports:
  - port: 3000
    targetPort: 3000
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: default
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: gcr.io/k8s-staging-gateway-api/echo-basic:v20231214-v1.0.0-140-gf544a46e
        ports:
        - containerPort: 3000
```

应用配置：

```bash
kubectl apply -f backend.yaml
```

### 3. 创建 HTTPRoute

创建 HTTPRoute 来定义路由规则：

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: backend-route
  namespace: default
spec:
  parentRefs:
  - name: eg-gateway
  rules:
  - matches:
    - path:
        type: PathPrefix
        value: /
    backendRefs:
    - name: backend
      port: 3000
```

应用配置：

```bash
kubectl apply -f httproute.yaml
```

### 4. 测试访问

获取 Gateway 的外部 IP：

```bash
kubectl get gateway eg-gateway -o jsonpath='{.status.addresses[0].value}'
```

测试访问：

```bash
curl http://<GATEWAY_IP>/
```

## 常用功能

### 流量分割（金丝雀发布）

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: canary-route
spec:
  parentRefs:
  - name: eg-gateway
  rules:
  - backendRefs:
    - name: backend-v1
      port: 3000
      weight: 90
    - name: backend-v2
      port: 3000
      weight: 10
```

### 请求重定向

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: redirect-route
spec:
  parentRefs:
  - name: eg-gateway
  rules:
  - matches:
    - path:
        type: PathPrefix
        value: /old-path
    filters:
    - type: RequestRedirect
      requestRedirect:
        path:
          type: ReplaceFullPath
          replaceFullPath: /new-path
        statusCode: 301
```

### 请求头修改

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: header-route
spec:
  parentRefs:
  - name: eg-gateway
  rules:
  - filters:
    - type: RequestHeaderModifier
      requestHeaderModifier:
        add:
        - name: X-Custom-Header
          value: custom-value
        remove:
        - X-Remove-Header
    backendRefs:
    - name: backend
      port: 3000
```

### 超时配置

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: timeout-route
spec:
  parentRefs:
  - name: eg-gateway
  rules:
  - timeouts:
      request: 10s
    backendRefs:
    - name: backend
      port: 3000
```

### TLS/HTTPS 配置

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: eg-gateway-https
spec:
  gatewayClassName: eg
  listeners:
  - name: https
    protocol: HTTPS
    port: 443
    tls:
      mode: Terminate
      certificateRefs:
      - name: example-cert
```

## 常用命令

### 查看资源状态

```bash
# 查看所有 Gateway
kubectl get gateway

# 查看 HTTPRoute
kubectl get httproute

# 查看 Gateway 详细信息
kubectl describe gateway eg-gateway

# 查看 Envoy 代理日志
kubectl logs -n envoy-gateway-system deployment/envoy-gateway
```

### 调试命令

```bash
# 查看 Gateway 配置
kubectl get gateway eg-gateway -o yaml

# 查看 HTTPRoute 状态
kubectl get httproute backend-route -o yaml

# 检查 Envoy 配置
kubectl exec -n envoy-gateway-system deployment/envoy-gateway -- envoy --version
```

## 最佳实践

### 1. 命名空间隔离

为不同环境使用不同的命名空间：

```bash
# 开发环境
kubectl create namespace dev
# 生产环境
kubectl create namespace prod
```

### 2. 资源限制

为 Gateway 设置资源限制：

```yaml
apiVersion: gateway.envoyproxy.io/v1alpha1
kind: EnvoyProxy
metadata:
  name: custom-proxy-config
  namespace: envoy-gateway-system
spec:
  provider:
    type: Kubernetes
    kubernetes:
      envoyDeployment:
        container:
          resources:
            limits:
              cpu: 500m
              memory: 512Mi
            requests:
              cpu: 100m
              memory: 128Mi
```

### 3. 监控和可观测性

启用 Prometheus 监控：

```yaml
apiVersion: gateway.envoyproxy.io/v1alpha1
kind: EnvoyProxy
metadata:
  name: custom-proxy-config
  namespace: envoy-gateway-system
spec:
  telemetry:
    metrics:
      prometheus:
        disable: false
```

### 4. 安全配置

- 使用 TLS 加密通信
- 配置 RBAC 权限控制
- 定期更新 Envoy Gateway 版本
- 使用网络策略限制流量

## 故障排查

### 常见问题

**1. Gateway 无法创建**

检查 GatewayClass 是否存在：

```bash
kubectl get gatewayclass
```

**2. HTTPRoute 无法路由流量**

检查 HTTPRoute 状态：

```bash
kubectl describe httproute <route-name>
```

**3. 无法访问服务**

检查 Service 和 Pod 状态：

```bash
kubectl get svc
kubectl get pods
```

**4. 查看 Envoy Gateway 日志**

```bash
kubectl logs -n envoy-gateway-system -l control-plane=envoy-gateway --tail=100
```

## 参考资源

- [Envoy Gateway 官方文档](https://gateway.envoyproxy.io/)
- [Kubernetes Gateway API](https://gateway-api.sigs.k8s.io/)
- [Envoy Proxy 文档](https://www.envoyproxy.io/docs)
- [Gateway API 规范](https://gateway-api.sigs.k8s.io/concepts/api-overview/)

## 总结

Envoy Gateway 提供了一个强大且灵活的 API 网关解决方案，通过实现 Kubernetes Gateway API 规范，它为云原生应用提供了标准化的流量管理能力。主要优势包括：

- 基于 Envoy Proxy 的高性能代理
- 符合 Kubernetes Gateway API 标准
- 丰富的流量管理功能
- 良好的可观测性支持
- 活跃的社区和持续更新

通过本指南，你应该能够快速上手 Envoy Gateway，并在 Kubernetes 集群中部署和配置基本的网关功能。
