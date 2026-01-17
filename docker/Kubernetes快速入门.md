# Kubernetes 快速入门

## 什么是 Kubernetes？

Kubernetes (K8s) 是一个开源的容器编排平台，用于自动化部署、扩展和管理容器化应用程序。

**核心优势**：
- 🚀 自动化部署和回滚
- 📈 自动扩缩容
- 🔄 服务发现和负载均衡
- 💾 存储编排
- 🔧 自我修复
- 🔐 密钥和配置管理

---

## 核心概念

### 1. 集群架构

```
┌─────────────────────────────────────────────────┐
│                  Kubernetes 集群                 │
├─────────────────────────────────────────────────┤
│  Control Plane (控制平面)                        │
│  ┌──────────────────────────────────────────┐  │
│  │ API Server  │ Scheduler │ Controller    │  │
│  │ etcd (存储)                               │  │
│  └──────────────────────────────────────────┘  │
├─────────────────────────────────────────────────┤
│  Worker Nodes (工作节点)                        │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ Node 1  │  │ Node 2  │  │ Node 3  │        │
│  │ kubelet │  │ kubelet │  │ kubelet │        │
│  │ Pod     │  │ Pod     │  │ Pod     │        │
│  └─────────┘  └─────────┘  └─────────┘        │
└─────────────────────────────────────────────────┘
```

### 2. 核心组件

| 组件 | 说明 | 作用 |
|------|------|------|
| **Pod** | 最小部署单元 | 包含一个或多个容器 |
| **Service** | 服务抽象 | 提供稳定的网络访问 |
| **Deployment** | 部署控制器 | 管理 Pod 的副本和更新 |
| **ConfigMap** | 配置管理 | 存储非敏感配置 |
| **Secret** | 密钥管理 | 存储敏感信息 |
| **Namespace** | 命名空间 | 资源隔离 |
| **Ingress** | 入口控制器 | HTTP/HTTPS 路由 |
| **Volume** | 存储卷 | 持久化数据 |

---

## 安装 Kubernetes

### 方案 1: Minikube (本地学习)

**适用场景**：本地开发、学习测试

```bash
# Windows (使用 Scoop)
scoop install minikube

# macOS
brew install minikube

# Linux
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# 启动集群
minikube start --driver=docker

# 查看状态
minikube status

# 停止集群
minikube stop

# 删除集群
minikube delete
```

### 方案 2: Kind (Kubernetes in Docker)

**适用场景**：CI/CD、多集群测试

```bash
# 安装 Kind
# Windows (Scoop)
scoop install kind

# macOS
brew install kind

# 创建集群
kind create cluster --name my-cluster

# 查看集群
kind get clusters

# 删除集群
kind delete cluster --name my-cluster
```

### 方案 3: K3s (轻量级生产环境)

**适用场景**：边缘计算、资源受限环境

```bash
# 安装 K3s (Linux)
curl -sfL https://get.k3s.io | sh -

# 查看节点
sudo k3s kubectl get nodes

# 卸载
/usr/local/bin/k3s-uninstall.sh
```

---

## kubectl 命令行工具

### 安装 kubectl

```bash
# Windows (Scoop)
scoop install kubectl

# macOS
brew install kubectl

# Linux
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# 验证安装
kubectl version --client
```

### 常用命令速查

```bash
# ========== 集群信息 ==========
kubectl cluster-info              # 查看集群信息
kubectl get nodes                 # 查看节点
kubectl get namespaces            # 查看命名空间

# ========== 资源查看 ==========
kubectl get pods                  # 查看 Pod
kubectl get pods -A               # 查看所有命名空间的 Pod
kubectl get pods -o wide          # 查看详细信息
kubectl get svc                   # 查看 Service
kubectl get deploy                # 查看 Deployment
kubectl get all                   # 查看所有资源

# ========== 资源详情 ==========
kubectl describe pod <pod-name>   # 查看 Pod 详情
kubectl logs <pod-name>           # 查看日志
kubectl logs -f <pod-name>        # 实时查看日志
kubectl exec -it <pod-name> -- sh # 进入容器

# ========== 资源操作 ==========
kubectl apply -f <file.yaml>      # 创建/更新资源
kubectl delete -f <file.yaml>     # 删除资源
kubectl delete pod <pod-name>     # 删除 Pod
kubectl scale deploy <name> --replicas=3  # 扩缩容

# ========== 调试命令 ==========
kubectl port-forward <pod-name> 8080:80   # 端口转发
kubectl top nodes                 # 查看节点资源使用
kubectl top pods                  # 查看 Pod 资源使用
```

---

## 第一个应用：部署 Nginx

### 1. 创建 Deployment

创建文件 `nginx-deployment.yaml`：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3                    # 副本数
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
        resources:
          requests:
            memory: "64Mi"
            cpu: "250m"
          limits:
            memory: "128Mi"
            cpu: "500m"
```

### 2. 创建 Service

创建文件 `nginx-service.yaml`：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  type: NodePort              # 类型：ClusterIP / NodePort / LoadBalancer
  selector:
    app: nginx
  ports:
  - protocol: TCP
    port: 80                  # Service 端口
    targetPort: 80            # 容器端口
    nodePort: 30080           # 节点端口 (30000-32767)
```

### 3. 部署应用

```bash
# 应用配置
kubectl apply -f nginx-deployment.yaml
kubectl apply -f nginx-service.yaml

# 查看部署状态
kubectl get deployments
kubectl get pods
kubectl get services

# 访问应用
# Minikube
minikube service nginx-service

# 或使用端口转发
kubectl port-forward service/nginx-service 8080:80
# 浏览器访问: http://localhost:8080
```

### 4. 扩缩容

```bash
# 扩容到 5 个副本
kubectl scale deployment nginx-deployment --replicas=5

# 查看扩容结果
kubectl get pods

# 缩容到 2 个副本
kubectl scale deployment nginx-deployment --replicas=2
```

### 5. 滚动更新

```bash
# 更新镜像版本
kubectl set image deployment/nginx-deployment nginx=nginx:1.26

# 查看更新状态
kubectl rollout status deployment/nginx-deployment

# 查看更新历史
kubectl rollout history deployment/nginx-deployment

# 回滚到上一个版本
kubectl rollout undo deployment/nginx-deployment

# 回滚到指定版本
kubectl rollout undo deployment/nginx-deployment --to-revision=2
```

---

## Pod 详解

### Pod 生命周期

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌──────────┐
│ Pending │ -> │ Running │ -> │ Succeed │    │ Failed   │
└─────────┘    └─────────┘    └─────────┘    └──────────┘
                     │
                     v
              ┌──────────┐
              │ Unknown  │
              └──────────┘
```

### Pod 配置示例

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-app
  labels:
    app: my-app
    env: prod
spec:
  # 容器配置
  containers:
  - name: app
    image: nginx:1.25
    ports:
    - containerPort: 80

    # 环境变量
    env:
    - name: ENV
      value: "production"
    - name: DB_HOST
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: db.host

    # 资源限制
    resources:
      requests:
        memory: "64Mi"
        cpu: "250m"
      limits:
        memory: "128Mi"
        cpu: "500m"

    # 健康检查
    livenessProbe:
      httpGet:
        path: /health
        port: 80
      initialDelaySeconds: 30
      periodSeconds: 10

    readinessProbe:
      httpGet:
        path: /ready
        port: 80
      initialDelaySeconds: 5
      periodSeconds: 5

    # 挂载卷
    volumeMounts:
    - name: config
      mountPath: /etc/config
    - name: data
      mountPath: /data

  # 卷定义
  volumes:
  - name: config
    configMap:
      name: app-config
  - name: data
    persistentVolumeClaim:
      claimName: app-pvc

  # 重启策略
  restartPolicy: Always  # Always / OnFailure / Never
```

---

## Service 详解

### Service 类型

| 类型 | 说明 | 使用场景 |
|------|------|----------|
| **ClusterIP** | 集群内部访问 | 默认类型，服务间通信 |
| **NodePort** | 节点端口访问 | 开发测试，外部访问 |
| **LoadBalancer** | 负载均衡器 | 云环境，生产环境 |
| **ExternalName** | DNS 映射 | 访问外部服务 |

### ClusterIP 示例

```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  type: ClusterIP          # 默认类型
  selector:
    app: backend
  ports:
  - protocol: TCP
    port: 8080             # Service 端口
    targetPort: 8080       # Pod 端口
```

### NodePort 示例

```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  type: NodePort
  selector:
    app: frontend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
    nodePort: 30080        # 外部访问端口 (30000-32767)
```

### LoadBalancer 示例

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  type: LoadBalancer
  selector:
    app: web
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
```

---

## ConfigMap 配置管理

### 创建 ConfigMap

**方式 1: 从文件创建**

```bash
# 创建配置文件
echo "database.host=localhost" > app.properties
echo "database.port=3306" >> app.properties

# 从文件创建 ConfigMap
kubectl create configmap app-config --from-file=app.properties

# 查看 ConfigMap
kubectl get configmap
kubectl describe configmap app-config
```

**方式 2: 从字面值创建**

```bash
kubectl create configmap app-config \
  --from-literal=database.host=localhost \
  --from-literal=database.port=3306
```

**方式 3: YAML 文件**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  # 键值对
  database.host: "localhost"
  database.port: "3306"

  # 文件内容
  app.properties: |
    database.host=localhost
    database.port=3306
    database.name=mydb
```

### 使用 ConfigMap

**方式 1: 环境变量**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-pod
spec:
  containers:
  - name: app
    image: myapp:1.0
    env:
    # 单个键
    - name: DB_HOST
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: database.host

    # 所有键
    envFrom:
    - configMapRef:
        name: app-config
```

**方式 2: 挂载为文件**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-pod
spec:
  containers:
  - name: app
    image: myapp:1.0
    volumeMounts:
    - name: config
      mountPath: /etc/config
      readOnly: true

  volumes:
  - name: config
    configMap:
      name: app-config
```

---

## Secret 密钥管理

### 创建 Secret

**方式 1: 从文件创建**

```bash
# 创建密钥文件
echo -n 'admin' > username.txt
echo -n 'password123' > password.txt

# 创建 Secret
kubectl create secret generic db-secret \
  --from-file=username.txt \
  --from-file=password.txt
```

**方式 2: 从字面值创建**

```bash
kubectl create secret generic db-secret \
  --from-literal=username=admin \
  --from-literal=password=password123
```

**方式 3: YAML 文件 (Base64 编码)**

```bash
# 编码密钥
echo -n 'admin' | base64        # YWRtaW4=
echo -n 'password123' | base64  # cGFzc3dvcmQxMjM=
```

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
data:
  username: YWRtaW4=              # admin
  password: cGFzc3dvcmQxMjM=      # password123
```

### 使用 Secret

**方式 1: 环境变量**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-pod
spec:
  containers:
  - name: app
    image: myapp:1.0
    env:
    - name: DB_USERNAME
      valueFrom:
        secretKeyRef:
          name: db-secret
          key: username
    - name: DB_PASSWORD
      valueFrom:
        secretKeyRef:
          name: db-secret
          key: password
```

**方式 2: 挂载为文件**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-pod
spec:
  containers:
  - name: app
    image: myapp:1.0
    volumeMounts:
    - name: secret
      mountPath: /etc/secret
      readOnly: true

  volumes:
  - name: secret
    secret:
      secretName: db-secret
```

---

## Namespace 命名空间

### 命名空间作用

- 资源隔离（开发/测试/生产环境）
- 权限控制（RBAC）
- 资源配额限制

### 常用命令

```bash
# 查看命名空间
kubectl get namespaces

# 创建命名空间
kubectl create namespace dev
kubectl create namespace test
kubectl create namespace prod

# 删除命名空间
kubectl delete namespace dev

# 在指定命名空间操作
kubectl get pods -n dev
kubectl apply -f app.yaml -n dev

# 设置默认命名空间
kubectl config set-context --current --namespace=dev
```

### YAML 定义

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: dev
  labels:
    env: development
```

### 在资源中指定命名空间

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
  namespace: dev        # 指定命名空间
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: app
        image: myapp:1.0
```

---

## Volume 存储卷

### Volume 类型

| 类型 | 说明 | 使用场景 |
|------|------|----------|
| **emptyDir** | 临时目录 | Pod 内容器共享数据 |
| **hostPath** | 主机路径 | 访问节点文件系统 |
| **configMap** | 配置文件 | 挂载配置 |
| **secret** | 密钥文件 | 挂载密钥 |
| **persistentVolumeClaim** | 持久化存储 | 数据持久化 |
| **nfs** | NFS 网络存储 | 多节点共享 |

### emptyDir 示例

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-pod
spec:
  containers:
  - name: app
    image: nginx
    volumeMounts:
    - name: cache
      mountPath: /cache

  - name: sidecar
    image: busybox
    volumeMounts:
    - name: cache
      mountPath: /cache

  volumes:
  - name: cache
    emptyDir: {}          # Pod 删除时数据丢失
```

### hostPath 示例

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-pod
spec:
  containers:
  - name: app
    image: nginx
    volumeMounts:
    - name: host-data
      mountPath: /data

  volumes:
  - name: host-data
    hostPath:
      path: /data/app     # 节点路径
      type: DirectoryOrCreate
```

### PersistentVolume (PV) 和 PersistentVolumeClaim (PVC)

**PV 定义（管理员创建）**

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-data
spec:
  capacity:
    storage: 10Gi
  accessModes:
  - ReadWriteOnce         # ReadWriteOnce / ReadOnlyMany / ReadWriteMany
  persistentVolumeReclaimPolicy: Retain  # Retain / Delete / Recycle
  storageClassName: standard
  hostPath:
    path: /data/pv
```

**PVC 定义（用户创建）**

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-data
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
  storageClassName: standard
```

**在 Pod 中使用 PVC**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-pod
spec:
  containers:
  - name: app
    image: nginx
    volumeMounts:
    - name: data
      mountPath: /data

  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: pvc-data
```

---

## Ingress 入口控制器

### 什么是 Ingress？

Ingress 是 Kubernetes 的 HTTP/HTTPS 路由规则，提供：
- 基于域名的路由
- 基于路径的路由
- SSL/TLS 终止
- 负载均衡

### 安装 Ingress Controller (Nginx)

```bash
# Minikube 启用 Ingress
minikube addons enable ingress

# 或手动安装 Nginx Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# 查看 Ingress Controller
kubectl get pods -n ingress-nginx
```

### Ingress 示例

**单域名路由**

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
```

**多路径路由**

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
spec:
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 8080
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
```

**HTTPS 配置**

```bash
# 创建 TLS Secret
kubectl create secret tls tls-secret \
  --cert=tls.crt \
  --key=tls.key
```

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
spec:
  tls:
  - hosts:
    - myapp.example.com
    secretName: tls-secret
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: app-service
            port:
              number: 80
```

---

## 实战案例：部署完整应用

### 场景：部署 WordPress + MySQL

**1. 创建 Namespace**

```yaml
# wordpress-namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: wordpress
```

**2. 创建 MySQL Secret**

```bash
kubectl create secret generic mysql-secret \
  --from-literal=password=MyP@ssw0rd \
  -n wordpress
```

**3. 部署 MySQL**

```yaml
# mysql-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mysql
  namespace: wordpress
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
      - name: mysql
        image: mysql:8.0
        env:
        - name: MYSQL_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mysql-secret
              key: password
        - name: MYSQL_DATABASE
          value: wordpress
        ports:
        - containerPort: 3306
        volumeMounts:
        - name: mysql-data
          mountPath: /var/lib/mysql
      volumes:
      - name: mysql-data
        persistentVolumeClaim:
          claimName: mysql-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: mysql
  namespace: wordpress
spec:
  selector:
    app: mysql
  ports:
  - port: 3306
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mysql-pvc
  namespace: wordpress
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
```

**4. 部署 WordPress**

```yaml
# wordpress-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wordpress
  namespace: wordpress
spec:
  replicas: 2
  selector:
    matchLabels:
      app: wordpress
  template:
    metadata:
      labels:
        app: wordpress
    spec:
      containers:
      - name: wordpress
        image: wordpress:6.4
        env:
        - name: WORDPRESS_DB_HOST
          value: mysql
        - name: WORDPRESS_DB_NAME
          value: wordpress
        - name: WORDPRESS_DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mysql-secret
              key: password
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: wordpress
  namespace: wordpress
spec:
  type: LoadBalancer
  selector:
    app: wordpress
  ports:
  - port: 80
    targetPort: 80
```

**5. 部署应用**

```bash
# 应用所有配置
kubectl apply -f wordpress-namespace.yaml
kubectl apply -f mysql-deployment.yaml
kubectl apply -f wordpress-deployment.yaml

# 查看部署状态
kubectl get all -n wordpress

# 访问应用
kubectl get svc -n wordpress
# 使用 LoadBalancer 的 EXTERNAL-IP 访问
```

---

## 最佳实践

### 1. 资源管理

```yaml
# ✅ 始终设置资源请求和限制
resources:
  requests:
    memory: "64Mi"
    cpu: "250m"
  limits:
    memory: "128Mi"
    cpu: "500m"
```

### 2. 健康检查

```yaml
# ✅ 配置存活探针和就绪探针
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5
```

### 3. 标签和选择器

```yaml
# ✅ 使用有意义的标签
metadata:
  labels:
    app: myapp
    version: v1.0
    env: prod
    tier: backend
```

### 4. 命名规范

```yaml
# ✅ 使用小写字母和连字符
name: my-app-deployment
name: backend-service
name: mysql-pvc

# ❌ 避免
name: MyAppDeployment
name: backend_service
```

### 5. 使用 Namespace 隔离

```bash
# ✅ 按环境或团队隔离
kubectl create namespace dev
kubectl create namespace test
kubectl create namespace prod
```

### 6. 配置外部化

```yaml
# ✅ 使用 ConfigMap 和 Secret
env:
- name: DB_HOST
  valueFrom:
    configMapKeyRef:
      name: app-config
      key: db.host
```

### 7. 滚动更新策略

```yaml
# ✅ 配置更新策略
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
```

---

## 常见问题排查

### 1. Pod 无法启动

```bash
# 查看 Pod 状态
kubectl get pods
kubectl describe pod <pod-name>

# 常见原因
# - ImagePullBackOff: 镜像拉取失败
# - CrashLoopBackOff: 容器启动后崩溃
# - Pending: 资源不足或调度失败
```

### 2. 查看日志

```bash
# 查看当前日志
kubectl logs <pod-name>

# 查看上一次容器日志
kubectl logs <pod-name> --previous

# 实时查看日志
kubectl logs -f <pod-name>

# 多容器 Pod 指定容器
kubectl logs <pod-name> -c <container-name>
```

### 3. 进入容器调试

```bash
# 进入容器
kubectl exec -it <pod-name> -- /bin/bash
kubectl exec -it <pod-name> -- sh

# 执行单个命令
kubectl exec <pod-name> -- ls /app
kubectl exec <pod-name> -- env
```

### 4. 网络调试

```bash
# 端口转发
kubectl port-forward <pod-name> 8080:80

# 查看 Service 端点
kubectl get endpoints

# 测试 Service 连接
kubectl run test --image=busybox -it --rm -- wget -O- http://service-name:port
```

### 5. 资源不足

```bash
# 查看节点资源
kubectl top nodes

# 查看 Pod 资源使用
kubectl top pods

# 查看资源配额
kubectl describe resourcequota -n <namespace>
```

---

## kubectl 实用技巧

### 1. 命令别名

```bash
# 添加到 ~/.bashrc 或 ~/.zshrc
alias k='kubectl'
alias kgp='kubectl get pods'
alias kgs='kubectl get svc'
alias kgd='kubectl get deploy'
alias kd='kubectl describe'
alias kl='kubectl logs'
alias ke='kubectl exec -it'
```

### 2. 快速生成 YAML

```bash
# 生成 Deployment YAML（不创建）
kubectl create deployment nginx --image=nginx --dry-run=client -o yaml > deployment.yaml

# 生成 Service YAML
kubectl create service clusterip my-svc --tcp=80:80 --dry-run=client -o yaml > service.yaml

# 生成 ConfigMap YAML
kubectl create configmap my-config --from-literal=key=value --dry-run=client -o yaml > configmap.yaml
```

### 3. 输出格式

```bash
# JSON 格式
kubectl get pods -o json

# YAML 格式
kubectl get pods -o yaml

# 自定义列
kubectl get pods -o custom-columns=NAME:.metadata.name,STATUS:.status.phase

# JSONPath 查询
kubectl get pods -o jsonpath='{.items[*].metadata.name}'
```

### 4. 上下文切换

```bash
# 查看上下文
kubectl config get-contexts

# 切换上下文
kubectl config use-context <context-name>

# 查看当前上下文
kubectl config current-context

# 设置默认命名空间
kubectl config set-context --current --namespace=dev
```

### 5. 批量操作

```bash
# 删除所有 Pod
kubectl delete pods --all

# 删除特定标签的资源
kubectl delete pods -l app=nginx

# 批量应用 YAML
kubectl apply -f ./manifests/

# 递归应用目录
kubectl apply -f ./k8s/ -R
```

---

## 学习路径建议

### 初级阶段（1-2 周）

1. **理解核心概念**
   - Pod、Service、Deployment
   - Namespace、Label、Selector
   - ConfigMap、Secret

2. **本地环境搭建**
   - 安装 Minikube 或 Kind
   - 熟悉 kubectl 基本命令
   - 部署第一个应用

3. **实践项目**
   - 部署 Nginx
   - 部署 WordPress + MySQL
   - 配置 Service 访问

### 中级阶段（2-4 周）

1. **深入学习**
   - Volume 和持久化存储
   - Ingress 路由配置
   - 健康检查和探针
   - 资源限制和配额

2. **实践项目**
   - 部署微服务应用
   - 配置 Ingress 多域名路由
   - 实现滚动更新和回滚

### 高级阶段（1-2 月）

1. **进阶主题**
   - StatefulSet（有状态应用）
   - DaemonSet（守护进程）
   - Job 和 CronJob（任务调度）
   - HPA（水平自动扩缩容）
   - RBAC（权限控制）

2. **生产实践**
   - 监控和日志（Prometheus + Grafana）
   - CI/CD 集成
   - 多集群管理
   - 灾难恢复

---

## 学习资源

### 官方文档

- **Kubernetes 官方文档**: https://kubernetes.io/docs/
- **Kubernetes 中文文档**: https://kubernetes.io/zh-cn/docs/
- **kubectl 命令参考**: https://kubernetes.io/docs/reference/kubectl/

### 在线教程

- **Kubernetes 官方教程**: https://kubernetes.io/docs/tutorials/
- **Katacoda 交互式教程**: https://www.katacoda.com/courses/kubernetes
- **Play with Kubernetes**: https://labs.play-with-k8s.com/

### 书籍推荐

- 《Kubernetes in Action》（中文版：《Kubernetes 实战》）
- 《Kubernetes Up & Running》
- 《The Kubernetes Book》

### 视频课程

- Kubernetes 官方 YouTube 频道
- CNCF (Cloud Native Computing Foundation) 频道
- 各大在线教育平台的 K8s 课程

### 实践平台

- **Minikube**: 本地单节点集群
- **Kind**: Docker 中的 Kubernetes
- **K3s**: 轻量级 Kubernetes
- **云平台**: AWS EKS、Azure AKS、Google GKE

---

## 快速参考卡片

### 资源类型缩写

| 完整名称 | 缩写 | 说明 |
|----------|------|------|
| pods | po | Pod |
| services | svc | Service |
| deployments | deploy | Deployment |
| replicasets | rs | ReplicaSet |
| statefulsets | sts | StatefulSet |
| daemonsets | ds | DaemonSet |
| namespaces | ns | Namespace |
| configmaps | cm | ConfigMap |
| secrets | secret | Secret |
| persistentvolumes | pv | PersistentVolume |
| persistentvolumeclaims | pvc | PersistentVolumeClaim |
| ingresses | ing | Ingress |

### 常用命令速记

```bash
# 查看资源
k get po                    # 查看 Pod
k get po -A                 # 查看所有命名空间的 Pod
k get po -o wide            # 查看详细信息
k describe po <name>        # 查看 Pod 详情

# 日志和调试
k logs <pod>                # 查看日志
k logs -f <pod>             # 实时日志
k exec -it <pod> -- sh      # 进入容器

# 创建和删除
k apply -f <file>           # 创建/更新资源
k delete -f <file>          # 删除资源
k delete po <name>          # 删除 Pod

# 扩缩容
k scale deploy <name> --replicas=3

# 更新和回滚
k set image deploy/<name> <container>=<image>
k rollout status deploy/<name>
k rollout undo deploy/<name>
```

---

## 总结

### 核心要点回顾

1. **Kubernetes 是什么**
   - 容器编排平台
   - 自动化部署、扩展和管理
   - 云原生应用的基础设施

2. **核心概念**
   - **Pod**: 最小部署单元
   - **Service**: 服务发现和负载均衡
   - **Deployment**: 声明式部署和更新
   - **ConfigMap/Secret**: 配置和密钥管理
   - **Volume**: 数据持久化
   - **Namespace**: 资源隔离

3. **学习建议**
   - 从本地环境开始（Minikube/Kind）
   - 动手实践比理论更重要
   - 先掌握基础概念，再深入高级特性
   - 多看官方文档和示例

4. **下一步**
   - 部署自己的应用到 K8s
   - 学习 Helm 包管理器
   - 了解 CI/CD 集成
   - 探索云平台托管 K8s 服务

### 常见误区

- ❌ Kubernetes 不是 Docker 的替代品（它们是互补的）
- ❌ 不是所有应用都需要 K8s（小型应用可能过度设计）
- ❌ K8s 不会自动解决所有问题（需要正确配置）
- ❌ 学习曲线陡峭，但值得投入时间

### 最后的话

Kubernetes 是现代云原生应用的核心技术，掌握它将为你的职业发展带来巨大帮助。从简单的 Pod 部署开始，逐步深入，多动手实践，你会发现 K8s 的强大之处。

**记住**：
- 📚 多看官方文档
- 💻 多动手实践
- 🤝 多参与社区
- 🔄 持续学习更新

祝你学习愉快！🚀

---

**文档版本**: v1.0
**最后更新**: 2026-01-17
**作者**: Claude Code
**许可**: MIT License
