# Docker 快速启动指南

本指南提供最快速、最简洁的 ranbo-play Docker 部署方案。

> **建议**: 先看这个快速启动指南，然后查看详细的 `docs/DOCKER_DEPLOYMENT_GUIDE.md`

---

## 5 分钟快速开始（本地）

### 前置要求

- Docker 20.10+
- Docker Compose 1.29+

### 一条命令启动

```bash
# 进入项目目录
cd /path/to/ranbo-play

# 启动本地开发环境
docker compose up -d

# 查看状态
docker compose ps

# 访问应用
open http://localhost:8080

# 停止时
docker compose down
```

### 验证应用

```bash
# 健康检查
curl http://localhost:8080/health
# 输出: healthy

# 访问首页
curl http://localhost:8080/ -I
# HTTP/1.1 200 OK
```

---

## 构建和推送镜像

### 1. 本地构建测试

```bash
# 构建镜像
docker build -t ranbo-play:local .

# 运行容器
docker run -d -p 8080:80 --name ranbo-play-test ranbo-play:local

# 验证
curl http://localhost:8080/health

# 清理
docker stop ranbo-play-test
docker rm ranbo-play-test
```

### 2. 生产镜像构建

```bash
# 构建带版本号的镜像
docker build \
  --build-arg VERSION=1.0.0 \
  --build-arg BUILD_TIMESTAMP=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
  -t ranbo-play:1.0.0 \
  -t ranbo-play:latest \
  .

# 标记为仓库镜像
docker tag ranbo-play:1.0.0 ghcr.io/ranbo12138/ranbo-play:1.0.0
docker tag ranbo-play:latest ghcr.io/ranbo12138/ranbo-play:latest

# 推送到 GitHub Container Registry
echo $GH_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
docker push ghcr.io/ranbo12138/ranbo-play:1.0.0
docker push ghcr.io/ranbo12138/ranbo-play:latest
```

---

## 三种生产部署方案

### 方案 A: Docker 直接运行（最简单）

```bash
# 拉取镜像
docker pull ghcr.io/ranbo12138/ranbo-play:latest

# 运行容器
docker run -d \
  --name ranbo-play-prod \
  --restart always \
  -p 80:80 \
  -h ranbo-play-prod \
  ghcr.io/ranbo12138/ranbo-play:latest

# 查看日志
docker logs -f ranbo-play-prod

# 停止
docker stop ranbo-play-prod
docker rm ranbo-play-prod
```

### 方案 B: Docker Compose（推荐）

```bash
# 使用生产配置启动
docker compose -f docker-compose.prod.yml up -d

# 查看状态
docker compose -f docker-compose.prod.yml ps

# 查看日志
docker compose -f docker-compose.prod.yml logs -f

# 更新镜像
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d

# 停止
docker compose -f docker-compose.prod.yml down
```

### 方案 C: Kubernetes（企业级）

```bash
# 部署到 Kubernetes
kubectl apply -f k8s-deployment.yaml

# 查看 Pod 状态
kubectl get pods -n ranbo-play -l app=ranbo-play

# 查看服务
kubectl get svc -n ranbo-play

# 查看日志
kubectl logs -n ranbo-play -l app=ranbo-play -f

# 清理
kubectl delete -f k8s-deployment.yaml
```

---

## HTTPS/SSL 配置

### 使用 Let's Encrypt 和 Certbot

```bash
# 1. 生成证书
docker run --rm -it \
  -v /opt/letsencrypt:/etc/letsencrypt \
  certbot/certbot \
  certonly --standalone \
  -d yourdomain.com \
  -d www.yourdomain.com

# 2. 修改 nginx-prod.conf 中的 server_name 和 ssl_certificate 路径

# 3. 运行容器时挂载证书
docker run -d \
  -p 80:80 \
  -p 443:443 \
  -v /opt/letsencrypt:/etc/nginx/ssl:ro \
  -v ./nginx-prod.conf:/etc/nginx/conf.d/default.conf:ro \
  ghcr.io/ranbo12138/ranbo-play:latest
```

---

## 常见问题速查表

| 问题 | 解决方案 |
|-----|---------|
| 端口 80 被占用 | `docker run -p 8080:80 ...` 改用其他端口 |
| npm 依赖安装失败 | 使用国内镜像源：检查 `DOCKER_BUILDKIT=1 docker build ...` |
| 应用无法访问 | `docker logs <CONTAINER>` 查看日志 |
| 构建慢 | 检查网络连接，考虑使用国内 npm 源 |
| 磁盘空间不足 | `docker system prune -a --volumes` 清理 |

---

## 性能指标

| 指标 | 目标值 |
|-----|--------|
| 镜像大小 | 40-50 MB |
| 容器启动时间 | < 3 秒 |
| 首屏加载 | < 2 秒 |
| 健康检查响应 | < 500 ms |

---

## 检查清单（部署前）

```bash
# 运行验证脚本
chmod +x verify-docker-readiness.sh
./verify-docker-readiness.sh

# 应该看到：✓ 项目已准备好进行 Docker 部署！
```

---

## 监控和日志

### 查看实时日志

```bash
# Docker
docker logs -f <CONTAINER_ID>

# Docker Compose
docker compose logs -f

# Kubernetes
kubectl logs -f <POD_NAME> -n ranbo-play
```

### 检查容器资源使用

```bash
# Docker
docker stats

# Docker Compose
docker compose stats

# Kubernetes
kubectl top pods -n ranbo-play
```

### 容器健康检查

```bash
# Docker
docker ps --format "table {{.Names}}\t{{.Status}}"

# Docker Compose
docker compose ps

# Kubernetes
kubectl get pods -n ranbo-play
```

---

## 更新镜像

### Docker

```bash
# 停止旧容器
docker stop ranbo-play-prod
docker rm ranbo-play-prod

# 拉取新镜像
docker pull ghcr.io/ranbo12138/ranbo-play:latest

# 运行新容器
docker run -d --name ranbo-play-prod ... ghcr.io/ranbo12138/ranbo-play:latest
```

### Docker Compose

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

### Kubernetes

```bash
# 更新镜像
kubectl set image deployment/ranbo-play -n ranbo-play \
  ranbo-play=ghcr.io/ranbo12138/ranbo-play:latest --record

# 查看滚动更新状态
kubectl rollout status deployment/ranbo-play -n ranbo-play
```

---

## 环境变量

当前版本不需要运行时环境变量（静态 SPA）。

如果需要构建时配置，可修改 `mvu-generator/vite.config.js`。

---

## 下一步

1. **本地测试**: `docker compose up -d`
2. **查看详细指南**: `docs/DOCKER_DEPLOYMENT_GUIDE.md`
3. **配置 HTTPS**: 按上述步骤配置 SSL 证书
4. **部署到生产**: 选择上述三种方案之一

---

## 获取帮助

1. 查看完整指南：`docs/DOCKER_DEPLOYMENT_GUIDE.md`
2. 检查日志：`docker logs <CONTAINER>`
3. 验证配置：`docker run ... nginx -t`
4. 查看项目 GitHub Issues

---

**文档版本**: 1.0  
**支持框架**: Vue 3 + Vite  
**最后更新**: 2024
