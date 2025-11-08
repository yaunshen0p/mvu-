# Docker 部署指南 - ranbo-play MVU 状态栏生成器

本文档提供 ranbo-play Vue 3 + Vite 项目的完整 Docker 部署指南，包括项目状态验证、本地构建测试、以及生产环境部署步骤。

---

## 目录

- [项目状态检查](#项目状态检查)
- [核心文件审查](#核心文件审查)
- [本地构建与测试](#本地构建与测试)
- [Docker 容器构建](#docker-容器构建)
- [生产环境部署](#生产环境部署)
- [常见问题排查](#常见问题排查)
- [快速参考](#快速参考)

---

## 项目状态检查

### 当前项目配置

本项目已完成 Vue 3 + Vite 现代化重构，以下是关键信息：

| 检查项 | 状态 | 详情 |
|------|------|------|
| **框架** | ✅ Vue 3 | `vue@3.5.12` + `@vitejs/plugin-vue@5.2.4` |
| **构建工具** | ✅ Vite 6 | `vite@6.0.5` 配置完整 |
| **构建输出** | ✅ dist/ | `npm run build` 输出到 `/mvu-generator/dist` |
| **Node 版本** | ✅ 20+ | Dockerfile 使用 `node:20-alpine` |
| **Nginx** | ✅ 配置完整 | SPA 路由支持、缓存策略、安全头完整 |
| **Docker Compose** | ✅ 已配置 | 包含健康检查和自动重启策略 |
| **多阶段构建** | ✅ 已实现 | 优化镜像大小，约 40-50MB 生产镜像 |

### Vue 3 特定检查

```bash
# 验证 Vue 3 构建脚本
cat mvu-generator/package.json | grep -A 5 '"scripts"'
# 输出应为：
# "scripts": {
#   "dev": "vite",
#   "build": "vite build",
#   ...
# }

# 验证 Vite 配置
cat mvu-generator/vite.config.js | head -20
# 应包含：@vitejs/plugin-vue 插件
```

### 构建产物验证

- **输出目录**: `/mvu-generator/dist`（Vite 默认）
- **包含文件**:
  - `index.html` - 应用入口
  - `assets/` - 压缩后的 JS/CSS 和 Monaco 编辑器文件
  - `favicon.ico` - 网站图标

---

## 核心文件审查

### 1. Dockerfile 审查与改进

当前 Dockerfile 已完全兼容 Vue 3 + Vite，使用多阶段构建优化镜像大小：

**原理说明**:
- **第一阶段（构建）**: Node.js Alpine 镜像，执行 `npm ci` 和 `npm run build` 生成 dist 目录
- **第二阶段（运行）**: Nginx Alpine 镜像，仅复制构建产物和 Nginx 配置，不包含 Node.js

**完整 Dockerfile 内容**:

```dockerfile
# 多阶段构建 Dockerfile - 用于部署 ranbo-play Vue 3 + Vite SPA 应用
# Stage 1: 构建阶段 - 使用 Node.js 构建前端应用
FROM node:20-alpine AS builder

# 构建参数 - 用于元数据标签
ARG VERSION=1.0.0
ARG BUILD_TIMESTAMP

# 设置工作目录
WORKDIR /app

# 确保 node_modules/.bin 在 PATH 中
ENV PATH=/app/node_modules/.bin:$PATH

# 复制 package.json 和 package-lock.json 文件
# 利用 Docker 层缓存，只有当依赖变化时才重新安装
COPY mvu-generator/package*.json ./

# 安装项目依赖并清理缓存以减小镜像大小
RUN npm ci && npm cache clean --force

# 复制源代码到容器中
COPY mvu-generator/ ./

# 构建生产版本 - 生成 dist 目录
RUN npm run build

# Stage 2: 运行阶段 - 使用 Nginx 提供静态文件服务
FROM nginx:alpine AS runtime

# 构建参数 - 用于元数据标签
ARG VERSION=1.0.0
ARG BUILD_TIMESTAMP

# 移除 Nginx 默认配置文件
RUN rm /etc/nginx/conf.d/default.conf

# 复制自定义 Nginx 配置文件
# 配置文件路径: /etc/nginx/conf.d/nginx.conf
COPY nginx.conf /etc/nginx/conf.d/

# 从构建阶段复制构建产物到 Nginx 静态文件目录
# 关键路径映射: /app/dist -> /usr/share/nginx/html
COPY --from=builder /app/dist /usr/share/nginx/html

# 创建 Nginx 临时目录并设置正确的权限
# 确保nginx用户有权限写入缓存和日志目录
RUN mkdir -p /var/cache/nginx/client_temp \
    /var/cache/nginx/proxy_temp \
    /var/cache/nginx/fastcgi_temp \
    /var/cache/nginx/uwsgi_temp \
    /var/cache/nginx/scgi_temp && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# 以 root 用户运行容器（Nginx 会自动降权）
# 这是必需的，因为 Nginx 需要管理 PID 文件和绑定特权端口（80）

# 添加容器元数据标签
LABEL org.opencontainers.title="ranbo-play" \
      org.opencontainers.description="MVU 状态栏生成器 - Vue 3 + Vite SPA 应用" \
      org.opencontainers.version=${VERSION} \
      org.opencontainers.created=${BUILD_TIMESTAMP} \
      org.opencontainers.source="https://github.com/ranbo12138/ranbo-play"

# 暴露 80 端口
EXPOSE 80

# 启动 Nginx 服务器
# -g "daemon off;" 确保 Nginx 在前台运行，容器不会退出
CMD ["nginx", "-g", "daemon off;"]
```

**改进说明**:
- ✅ 已兼容 Vue 3 + Vite
- ✅ 注释已更新为 "Vue 3 + Vite SPA 应用"
- ✅ 多阶段构建已正确配置
- ✅ 依赖缓存已优化（分离 package.json 复制）

### 2. nginx.conf 审查

Nginx 配置已完全兼容 Vue 3 SPA，支持前端路由：

**完整 nginx.conf 内容**:

```nginx
# Nginx 配置文件 - 用于部署 ranbo-play Vue 3 + Vite SPA 应用
# 支持前端路由、静态资源缓存、Gzip 压缩和安全头

server {
    # 监听 80 端口
    listen 80;
    server_name localhost;
    
    # 设置网站根目录 - 与 Dockerfile 中的 COPY 路径一致
    root /usr/share/nginx/html;
    index index.html;
    
    # 启用 Gzip 压缩以减少传输大小
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # 安全响应头 - 防止 XSS 点击劫持等攻击
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # 静态资源缓存 - 长期缓存以提高性能
    # 包括 JS、CSS、图片、字体等不会经常变化的文件
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary Accept-Encoding;
    }
    
    # HTML 文件不缓存 - 确保应用更新能立即生效
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
    }
    
    # SPA 路由支持 - 关键配置！
    # 对于所有不存在的文件路径，都返回 index.html
    # 这样前端路由（Vue Router）就能接管路由处理
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 健康检查端点 - 用于负载均衡器和监控系统
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # 错误页面配置
    # 404 错误重定向到 index.html（SPA 处理）
    error_page 404 /index.html;
    # 5xx 错误显示自定义错误页面
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

**配置要点**:
- ✅ SPA 路由支持（`try_files $uri $uri/ /index.html`）
- ✅ 静态资源 1 年长期缓存（减少带宽和首屏时间）
- ✅ HTML 文件不缓存（确保应用及时更新）
- ✅ Gzip 压缩已启用（减少传输大小 70%+）
- ✅ 安全响应头已配置
- ✅ 健康检查端点（用于 Kubernetes/容器编排）

### 3. docker-compose.yml 审查

```yaml
services:
  ranbo-play:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8080:80"
    container_name: ranbo-play-local
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://127.0.0.1/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

**配置说明**:
- ✅ 本地开发完整配置
- ✅ 健康检查已配置（通过 `/health` 端点）
- ✅ 自动重启已启用（容器崩溃时自动恢复）

---

## 本地构建与测试

### 前置要求

在开始前，请确保已安装：

| 工具 | 版本 | 说明 |
|-----|------|------|
| Docker | 20.10+ | 容器运行时 |
| Docker Compose | 1.29+ | 容器编排工具 |
| Node.js | 18+ | （可选）本地测试构建 |
| npm | 9+ | （可选）本地测试构建 |

### 步骤 1: 验证项目结构

```bash
# 进入项目目录
cd /path/to/ranbo-play

# 验证关键文件是否存在
echo "检查文件..."
ls -1 | grep -E "Dockerfile|nginx.conf|docker-compose.yml"
# 输出应为:
# Dockerfile
# docker-compose.yml
# nginx.conf

# 检查 mvu-generator 目录结构
ls -la mvu-generator/
# 应包含: package.json, vite.config.js, src/, public/ 等
```

### 步骤 2: 本地 npm 构建验证（可选）

如果已安装 Node.js，可先验证本地构建：

```bash
# 进入应用目录
cd mvu-generator

# 安装依赖
npm install
# 输出应为: added XXX packages

# 运行开发服务器（可选，验证应用是否能启动）
npm run dev
# 访问 http://localhost:5173 查看应用
# 按 Ctrl+C 停止服务器

# 构建生产版本
npm run build
# 输出应为:
# ✓ XXX modules transformed
# dist/index.html XXX.XX kB
# dist/assets/index-XXXXX.js XXX.XX kB
# dist/assets/index-XXXXX.css XX.XX kB

# 验证构建产物
ls -la dist/
# 应包含: index.html, assets/ 等文件夹

# 返回项目根目录
cd ..
```

### 步骤 3: Docker 镜像构建

#### 方法 A: 使用 Docker 命令直接构建

```bash
# 进入项目根目录
cd /path/to/ranbo-play

# 构建镜像（指定标签为 ranbo-play:local）
docker build -t ranbo-play:local .

# 输出示例：
# [+] Building 120.5s (12/12) FINISHED
# => [builder 1/4] FROM node:20-alpine
# => [builder 2/4] WORKDIR /app
# => [builder 3/4] COPY mvu-generator/package*.json ./
# => [builder 4/4] RUN npm ci && npm cache clean --force
# => [builder 5/4] COPY mvu-generator/ ./
# => [builder 6/4] RUN npm run build
# => [runtime 1/4] FROM nginx:alpine
# ...
# => exporting to image
# => naming to docker.io/library/ranbo-play:local

# 验证镜像是否生成成功
docker images | grep ranbo-play:local
# 输出应为：
# REPOSITORY   TAG    IMAGE ID       CREATED          SIZE
# ranbo-play   local  XXXXXXXX      X seconds ago    45MB
```

#### 方法 B: 使用 Docker Compose 构建（推荐开发用）

```bash
# 进入项目根目录
cd /path/to/ranbo-play

# 构建镜像
docker compose build

# 输出示例：
# [+] Building 120.5s (12/12) FINISHED
# ...
```

### 步骤 4: 容器运行测试

#### 方法 A: 直接运行 Docker 容器

```bash
# 运行容器
docker run -d -p 8080:80 --name ranbo-play-test ranbo-play:local

# 验证容器已启动
docker ps | grep ranbo-play-test
# 输出应为：
# CONTAINER ID  IMAGE              PORTS           NAMES
# XXXXXXXX      ranbo-play:local   0.0.0.0:8080    ranbo-play-test

# 查看容器日志
docker logs ranbo-play-test
# 输出应为：
# /docker-entrypoint.sh: /etc/nginx/conf.d/ is not empty, skipping
# /docker-entrypoint.sh: launching /usr/sbin/nginx
# 2024-01-XX 10:30:45 [notice] XXXX#XXXX: master process started

# 测试健康检查
curl http://localhost:8080/health
# 输出：healthy

# 测试应用访问
curl http://localhost:8080/ -I
# 输出应为：
# HTTP/1.1 200 OK
# Content-Type: text/html; charset=utf-8
# ...
```

#### 方法 B: 使用 Docker Compose 运行（推荐）

```bash
# 启动所有服务
docker compose up -d

# 查看服务状态
docker compose ps
# 输出应为：
# NAME                COMMAND            SERVICE    STATUS           PORTS
# ranbo-play-local    nginx -g daemon... ranbo-play up (healthy)  0.0.0.0:8080->80/tcp

# 实时查看日志
docker compose logs -f

# 停止服务（保留容器）
docker compose stop

# 启动已停止的服务
docker compose start

# 停止并删除容器
docker compose down

# 停止并删除所有内容（包括卷）
docker compose down -v
```

### 步骤 5: 在浏览器中测试

打开浏览器，访问以下 URL 进行测试：

| URL | 预期结果 | 说明 |
|-----|---------|------|
| http://localhost:8080 | 加载应用首页 | SPA 应用应正常加载 |
| http://localhost:8080/health | 返回 "healthy" | 健康检查端点 |
| http://localhost:8080/some/route | 加载首页 | 验证前端路由支持（SPA） |
| http://localhost:8080/assets/... | 加载资源 | 验证静态资源可访问 |

### 步骤 6: 验证缓存和性能

```bash
# 检查第一次请求的响应头
curl -I http://localhost:8080/assets/index-abc123.js
# 输出应包含：
# Cache-Control: public, immutable
# Expires: Wed, XX XX XXXX XX:XX:XX GMT

# 检查 HTML 文件的缓存策略
curl -I http://localhost:8080/
# 输出应包含：
# Cache-Control: no-cache, no-store, must-revalidate
```

### 步骤 7: 清理本地测试环境

```bash
# 停止并删除测试容器
docker stop ranbo-play-test
docker rm ranbo-play-test

# 或使用 Docker Compose 清理
docker compose down

# 删除本地镜像（如果不再需要）
docker rmi ranbo-play:local
```

---

## Docker 容器构建

### 构建优化参数

#### 标准构建命令

```bash
# 基础构建（开发/测试用）
docker build -t ranbo-play:local .
```

#### 生产构建命令（带版本号和时间戳）

```bash
# 推荐用于生产环境
docker build \
  --build-arg VERSION=1.0.0 \
  --build-arg BUILD_TIMESTAMP=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
  -t ranbo-play:1.0.0 \
  -t ranbo-play:latest \
  .
```

#### 参数说明

| 参数 | 示例 | 说明 |
|-----|------|------|
| VERSION | 1.0.0 | 版本号，用于镜像标签和元数据 |
| BUILD_TIMESTAMP | 2024-01-XX... | 构建时间戳，便于审计和追踪 |

### 多标签推送流程

```bash
# 1. 构建多个标签的镜像
docker build \
  --build-arg VERSION=1.0.0 \
  --build-arg BUILD_TIMESTAMP=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
  -t ranbo-play:1.0.0 \
  -t ranbo-play:latest \
  -t ghcr.io/ranbo12138/ranbo-play:1.0.0 \
  -t ghcr.io/ranbo12138/ranbo-play:latest \
  .

# 2. 推送到 GitHub Container Registry (GHCR)
# 首先登录（如果未登录）
echo $GH_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# 推送所有标签
docker push ghcr.io/ranbo12138/ranbo-play:1.0.0
docker push ghcr.io/ranbo12138/ranbo-play:latest

# 3. 推送到 Docker Hub（如果需要）
docker tag ranbo-play:1.0.0 ranbo12138/ranbo-play:1.0.0
docker push ranbo12138/ranbo-play:1.0.0
```

### 构建故障排查

| 问题 | 原因 | 解决方案 |
|-----|------|---------|
| `npm ci failed` | 依赖安装失败 | 检查网络连接，尝试 `npm ci --prefer-offline` |
| `npm run build failed` | 构建失败 | 检查 Node 版本，查看详细错误日志 |
| `disk space` | 磁盘空间不足 | 清理 Docker 缓存：`docker system prune -a` |

---

## 生产环境部署

### 前置准备

#### 1. 环境要求

- Docker 20.10+ 或容器编排平台（Kubernetes、Docker Swarm 等）
- 足够的磁盘空间（至少 500MB）
- 网络连接正常

#### 2. 注册表登录

```bash
# GitHub Container Registry (推荐)
echo $GH_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# 或 Docker Hub
docker login
```

### 部署方案选择

#### 方案 A: 直接 Docker 运行（简单、适合小型部署）

```bash
# 1. 从镜像库拉取镜像
docker pull ghcr.io/ranbo12138/ranbo-play:latest

# 2. 运行容器（详细参数说明）
docker run \
  -d \
  --name ranbo-play-prod \
  --restart always \
  --health-cmd='wget --no-verbose --tries=1 --spider http://127.0.0.1/health' \
  --health-interval=30s \
  --health-timeout=10s \
  --health-retries=3 \
  --health-start-period=40s \
  -p 80:80 \
  -p 443:443 \
  -e TZ=UTC \
  ghcr.io/ranbo12138/ranbo-play:latest

# 参数说明：
# -d: 后台运行
# --name: 容器名称
# --restart always: 容器异常退出时自动重启
# --health-*: 健康检查配置
# -p: 端口映射（主机端口:容器端口）
# -e TZ=UTC: 设置时区

# 3. 验证容器状态
docker ps | grep ranbo-play-prod
docker stats ranbo-play-prod  # 查看资源使用情况
docker logs ranbo-play-prod   # 查看日志

# 4. 停止容器
docker stop ranbo-play-prod

# 5. 删除容器
docker rm ranbo-play-prod
```

#### 方案 B: Docker Compose 部署（推荐）

**生产环境 docker-compose.yml 示例**:

```yaml
version: '3.8'

services:
  ranbo-play:
    image: ghcr.io/ranbo12138/ranbo-play:latest
    container_name: ranbo-play-prod
    restart: always
    ports:
      - "0.0.0.0:80:80"
      - "0.0.0.0:443:443"
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://127.0.0.1/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    environment:
      - TZ=UTC
    volumes:
      - ./nginx-custom.conf:/etc/nginx/conf.d/default.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    networks:
      - ranbo-network
    labels:
      - "com.example.description=ranbo-play MVU Generator"

networks:
  ranbo-network:
    driver: bridge
```

**部署命令**:

```bash
# 1. 启动服务
docker compose -f docker-compose.prod.yml up -d

# 2. 查看服务状态
docker compose -f docker-compose.prod.yml ps

# 3. 查看日志
docker compose -f docker-compose.prod.yml logs -f

# 4. 更新镜像并重新部署
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d

# 5. 停止服务
docker compose -f docker-compose.prod.yml down
```

#### 方案 C: Kubernetes 部署（大规模、推荐）

**Kubernetes Deployment 示例** (`k8s-deployment.yaml`):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ranbo-play
  namespace: default
  labels:
    app: ranbo-play
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: ranbo-play
  template:
    metadata:
      labels:
        app: ranbo-play
    spec:
      containers:
      - name: ranbo-play
        image: ghcr.io/ranbo12138/ranbo-play:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 80
          name: http
          protocol: TCP
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        resources:
          requests:
            memory: "64Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "500m"
        securityContext:
          runAsNonRoot: false
          allowPrivilegeEscalation: false

---
apiVersion: v1
kind: Service
metadata:
  name: ranbo-play-service
  namespace: default
spec:
  type: LoadBalancer
  selector:
    app: ranbo-play
  ports:
  - name: http
    port: 80
    targetPort: 80
    protocol: TCP

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ranbo-play-hpa
  namespace: default
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ranbo-play
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

**部署命令**:

```bash
# 1. 应用 Kubernetes 配置
kubectl apply -f k8s-deployment.yaml

# 2. 查看 Pod 状态
kubectl get pods -l app=ranbo-play
kubectl describe pod <pod-name>

# 3. 查看服务
kubectl get svc ranbo-play-service
kubectl describe svc ranbo-play-service

# 4. 查看日志
kubectl logs -l app=ranbo-play -f

# 5. 扩缩容
kubectl scale deployment ranbo-play --replicas=5

# 6. 更新镜像
kubectl set image deployment/ranbo-play ranbo-play=ghcr.io/ranbo12138/ranbo-play:latest --record

# 7. 检查滚动更新状态
kubectl rollout status deployment/ranbo-play
```

### SSL/HTTPS 配置

#### Nginx + Let's Encrypt 配置

**1. 生成 SSL 证书**:

```bash
# 安装 Certbot
docker run --rm -it \
  -v /opt/letsencrypt:/etc/letsencrypt \
  certbot/certbot \
  certonly --standalone \
  -d yourdomain.com \
  -d www.yourdomain.com

# 证书位置：/opt/letsencrypt/live/yourdomain.com/
```

**2. 修改 nginx.conf 支持 HTTPS**:

```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL 证书配置
    ssl_certificate /etc/nginx/ssl/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/live/yourdomain.com/privkey.pem;
    
    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # HTTP 到 HTTPS 重定向
    if ($scheme != "https") {
        return 301 https://$server_name$request_uri;
    }
    
    # 其他配置保持不变
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**3. Docker 运行命令**:

```bash
docker run -d \
  -p 80:80 \
  -p 443:443 \
  -v /opt/letsencrypt:/etc/nginx/ssl:ro \
  -v ./nginx-https.conf:/etc/nginx/conf.d/default.conf:ro \
  ghcr.io/ranbo12138/ranbo-play:latest
```

### 生产部署检查清单

```bash
# 部署前验证清单
echo "=== 生产部署检查清单 ==="

# 1. 镜像验证
echo "✓ 镜像存在且标签正确"
docker images | grep ranbo-play

# 2. 配置验证
echo "✓ nginx.conf 已正确配置"
grep -q "try_files \$uri \$uri/ /index.html" nginx.conf && echo "  SPA 路由：✅"
grep -q "gzip on" nginx.conf && echo "  Gzip 压缩：✅"

# 3. Dockerfile 验证
echo "✓ Dockerfile 已验证"
grep -q "npm run build" Dockerfile && echo "  Vue 3 构建：✅"
grep -q "FROM nginx:alpine" Dockerfile && echo "  Nginx 部署：✅"

# 4. 端口验证
echo "✓ 端口配置"
netstat -tln | grep -E ":(80|443)" && echo "  80/443 端口可用：✅" || echo "  80/443 端口被占用：❌"

# 5. 磁盘空间验证
echo "✓ 磁盘空间检查"
df -h | grep -E "/$"

# 6. 安全检查
echo "✓ 安全检查"
grep -q "X-Content-Type-Options" nginx.conf && echo "  安全头：✅"
```

### 常见生产部署命令

```bash
# 镜像管理
docker images
docker tag ranbo-play:1.0.0 ghcr.io/ranbo12138/ranbo-play:1.0.0
docker push ghcr.io/ranbo12138/ranbo-play:1.0.0
docker rmi <IMAGE_ID>

# 容器管理
docker ps -a
docker logs <CONTAINER_ID>
docker exec -it <CONTAINER_ID> /bin/sh
docker inspect <CONTAINER_ID>
docker stats

# 资源清理
docker system df
docker system prune -a --volumes
docker container prune
docker image prune
```

---

## 常见问题排查

### 问题 1: 构建时 npm 依赖安装失败

**症状**: 构建过程中 `npm ci` 失败

**常见错误信息**:
```
npm ERR! network getaddrinfo ENOTFOUND registry.npmjs.org
npm ERR! network This is a problem related to network connectivity
```

**解决方案**:

```bash
# 1. 检查网络连接
ping registry.npmjs.org

# 2. 使用镜像源加速（中国用户）
docker build --build-arg npm_registry="https://registry.npmmirror.com" -t ranbo-play:local .

# 3. 修改 Dockerfile 添加 npm 镜像源
# 在 RUN npm ci 前添加：
# RUN npm config set registry https://registry.npmmirror.com

# 4. 或修改 .npmrc 文件（如果存在）
echo "registry=https://registry.npmmirror.com" > mvu-generator/.npmrc
docker build -t ranbo-play:local .
```

### 问题 2: 构建成功但容器无法启动

**症状**: `docker run` 后容器立即退出

**排查步骤**:

```bash
# 1. 查看容器日志
docker logs ranbo-play-test

# 2. 检查容器健康状态
docker ps -a | grep ranbo-play-test
docker inspect ranbo-play-test | grep -A 5 Health

# 3. 交互式启动容器查看错误
docker run -it ranbo-play:local /bin/sh
# 手动运行：nginx -g "daemon off;"

# 4. 检查端口是否被占用
netstat -tln | grep :80
lsof -i :80
```

**常见原因和解决**:

| 原因 | 解决方案 |
|-----|---------|
| 端口 80 被占用 | `sudo lsof -i :80` 查看占用进程，`docker run -p 8080:80` 改用其他端口 |
| nginx 配置错误 | 检查 nginx.conf 语法：`docker run -it ranbo-play:local nginx -t` |
| 权限问题 | 检查 Dockerfile 权限设置，`chmod -R 755 /usr/share/nginx/html` |

### 问题 3: 应用加载但页面显示空白或 404

**症状**: 访问 http://localhost:8080 返回空白或 404

**原因分析**:

```bash
# 1. 检查 dist 目录是否包含 index.html
docker run -it ranbo-play:local ls -la /usr/share/nginx/html/

# 2. 检查 Nginx 访问日志
docker exec ranbo-play-test cat /var/log/nginx/access.log

# 3. 测试 index.html 是否可访问
curl -v http://localhost:8080/index.html

# 4. 检查是否是构建问题
docker run -it ranbo-play:local ls -la /usr/share/nginx/html/assets/
```

**解决方案**:

1. 检查 `npm run build` 是否成功生成 dist 目录
2. 验证 Dockerfile `COPY --from=builder /app/dist /usr/share/nginx/html` 路径正确
3. 检查 nginx.conf 中 `root /usr/share/nginx/html` 是否正确

### 问题 4: 前端路由不工作（访问 `/some/route` 返回 404）

**症状**: 单页应用在刷新某些路由后显示 404

**原因**: nginx.conf 中 SPA 路由配置不正确

**解决方案**:

```bash
# 1. 检查 nginx.conf 配置
grep -A 2 "location /" nginx.conf
# 应输出：
# location / {
#     try_files $uri $uri/ /index.html;
# }

# 2. 测试路由重定向
curl -I http://localhost:8080/some/route
# 应返回 200，不是 404

# 3. 如果仍然 404，检查 Nginx 配置语法
docker exec ranbo-play-test nginx -t

# 4. 重新加载 Nginx 配置
docker exec ranbo-play-test nginx -s reload
```

### 问题 5: 性能问题（加载缓慢）

**症状**: 应用首次加载缓慢或资源加载慢

**排查和优化**:

```bash
# 1. 检查 Gzip 是否启用
curl -H "Accept-Encoding: gzip" -I http://localhost:8080/assets/index-abc123.js
# 应包含：Content-Encoding: gzip

# 2. 检查资源缓存
curl -I http://localhost:8080/assets/index-abc123.js
# 应包含：Cache-Control: public, immutable

# 3. 检查镜像大小
docker images | grep ranbo-play:local
# 应约 40-50MB

# 4. 检查容器资源使用
docker stats ranbo-play-test

# 5. 优化措施
# a) 确保 Gzip 压缩已启用
# b) 确保资源缓存头正确设置
# c) 考虑使用 CDN 加速
# d) 检查 Vite 构建是否进行了代码分割
```

### 问题 6: Docker Build 磁盘空间不足

**症状**: 构建失败，提示 "no space left on device"

**解决方案**:

```bash
# 1. 检查磁盘空间
df -h

# 2. 清理 Docker 系统
docker system prune -a --volumes

# 3. 清理 Docker 缓存
docker builder prune

# 4. 使用 --no-cache 重新构建
docker build --no-cache -t ranbo-play:local .

# 5. 检查 Docker 镜像存储位置
docker info | grep "Docker Root Dir"

# 6. 如需要，清理特定镜像
docker rmi <IMAGE_ID>
```

### 问题 7: 容器内 Nginx 日志位置和查看方式

**查看实时日志**:

```bash
# 查看 Nginx 访问日志
docker exec ranbo-play-test tail -f /var/log/nginx/access.log

# 查看 Nginx 错误日志
docker exec ranbo-play-test tail -f /var/log/nginx/error.log

# 查看完整容器日志（包含启动信息）
docker logs -f ranbo-play-test

# 查看最后 100 行日志
docker logs --tail 100 ranbo-play-test

# 查看特定时间范围的日志
docker logs --since "2024-01-20T10:00:00" ranbo-play-test
```

### 问题 8: CORS 问题（如果集成了 API）

**症状**: 浏览器控制台显示 CORS 错误

**解决方案**:

在 nginx.conf 中添加 CORS 头：

```nginx
location / {
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range' always;
    
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Max-Age' 1728000;
        add_header 'Content-Type' 'text/plain; charset=utf-8';
        add_header 'Content-Length' 0;
        return 204;
    }
    
    try_files $uri $uri/ /index.html;
}
```

### 问题 9: 更新镜像后容器仍然使用旧版本

**症状**: 运行 `docker pull` 后启动的仍是旧容器

**解决方案**:

```bash
# 1. 删除旧容器
docker stop ranbo-play-prod
docker rm ranbo-play-prod

# 2. 拉取最新镜像
docker pull ghcr.io/ranbo12138/ranbo-play:latest

# 3. 运行新容器
docker run -d -p 80:80 --name ranbo-play-prod ghcr.io/ranbo12138/ranbo-play:latest

# 4. 或使用 Docker Compose 更新
docker compose down
docker compose pull
docker compose up -d
```

---

## 快速参考

### 快速命令速查表

#### 本地开发

```bash
# 完整开发流程
cd /path/to/ranbo-play
docker compose up -d          # 启动本地环境
docker compose logs -f        # 查看日志
docker compose down           # 停止开发环境

# 快速访问
# 应用: http://localhost:8080
# 健康检查: http://localhost:8080/health
```

#### 镜像构建

```bash
# 开发构建
docker build -t ranbo-play:local .

# 生产构建
docker build \
  --build-arg VERSION=1.0.0 \
  --build-arg BUILD_TIMESTAMP=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
  -t ranbo-play:1.0.0 \
  -t ranbo-play:latest .
```

#### 容器管理

```bash
# 启动
docker run -d -p 8080:80 --name ranbo-play ranbo-play:local

# 查看
docker ps
docker logs -f ranbo-play

# 停止
docker stop ranbo-play
docker rm ranbo-play

# 清理
docker system prune -a
```

#### 生产部署

```bash
# 拉取镜像
docker pull ghcr.io/ranbo12138/ranbo-play:latest

# 运行容器
docker run -d \
  --restart always \
  -p 80:80 \
  --name ranbo-play-prod \
  ghcr.io/ranbo12138/ranbo-play:latest

# Docker Compose 部署
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml logs -f
docker compose -f docker-compose.prod.yml down
```

### 环境变量速查表

| 变量 | 用途 | 示例 |
|-----|------|------|
| TZ | 容器时区 | TZ=Asia/Shanghai |
| BUILD_TIMESTAMP | 镜像构建时间 | $(date -u +'%Y-%m-%dT%H:%M:%SZ') |
| VERSION | 镜像版本号 | 1.0.0 |
| npm_registry | npm 镜像源 | https://registry.npmmirror.com |

### 文件位置速查表

| 文件 | 位置 | 说明 |
|-----|------|------|
| 应用源代码 | `/mvu-generator/src` | Vue 3 应用源代码 |
| 构建配置 | `/mvu-generator/vite.config.js` | Vite 构建配置 |
| 构建产物 | `/mvu-generator/dist` | 本地构建输出 |
| Docker 配置 | `/Dockerfile` | 容器构建文件 |
| Nginx 配置 | `/nginx.conf` | 服务器配置 |
| 容器编排 | `/docker-compose.yml` | 本地开发配置 |
| Kubernetes | `./k8s-deployment.yaml` | Kubernetes 部署配置 |

### 端口速查表

| 端口 | 服务 | 说明 |
|-----|------|------|
| 80 | HTTP | 容器内 Nginx 监听 |
| 8080 | HTTP | 本地开发映射（宿主机） |
| 443 | HTTPS | 生产 SSL 端口（需配置证书） |
| 5173 | Dev Server | 本地 Vite 开发服务器 |

### 健康检查

```bash
# 检查容器健康状态
docker ps --format "table {{.Names}}\t{{.Status}}"

# 手动健康检查
curl http://localhost:8080/health
# 预期输出：healthy

# 查看健康检查详情
docker inspect ranbo-play-test | grep -A 10 "Health"
```

---

## 总结

本指南涵盖了 ranbo-play Vue 3 + Vite 项目从本地开发到生产部署的完整流程：

1. ✅ **项目验证**: 确认 Vue 3 + Vite 构建配置正确
2. ✅ **文件审查**: Dockerfile、nginx.conf、docker-compose.yml 已完全兼容
3. ✅ **本地测试**: 提供了详细的逐步构建和测试指南
4. ✅ **多种部署方案**: 支持 Docker、Docker Compose、Kubernetes
5. ✅ **问题排查**: 列举了常见问题和解决方案

### 下一步行动

1. 按照本地测试章节进行验证
2. 选择适合的生产部署方案
3. 根据需要配置 SSL/HTTPS
4. 建立监控和日志收集
5. 定期更新镜像和依赖

### 获取帮助

如有问题，请按以下顺序排查：

1. 查看本文档的常见问题章节
2. 检查 Docker 容器日志：`docker logs <CONTAINER_ID>`
3. 检查 Nginx 配置：`docker exec <CONTAINER_ID> nginx -t`
4. 查看项目 GitHub 上的 Issues

---

**文档版本**: 1.0  
**更新日期**: 2024  
**支持框架**: Vue 3 + Vite  
**构建工具**: Docker + Nginx  
**兼容平台**: Linux, macOS, Windows (WSL2)
