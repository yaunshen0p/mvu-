#!/bin/bash

# Docker 部署前验证脚本
# 用于验证项目是否准备好进行 Docker 部署
#
# 使用方法：
#   chmod +x verify-docker-readiness.sh
#   ./verify-docker-readiness.sh

set -e

echo "=========================================="
echo "ranbo-play Docker 部署前验证"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查计数
PASSED=0
FAILED=0
WARNINGS=0

# 检查函数
check_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $description: $file"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $description: $file (缺失)"
        ((FAILED++))
    fi
}

check_command() {
    local cmd=$1
    local description=$2
    
    if command -v "$cmd" &> /dev/null; then
        local version=$($cmd --version 2>&1 | head -n1)
        echo -e "${GREEN}✓${NC} $description: $version"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $description: 未安装"
        ((FAILED++))
    fi
}

check_content() {
    local file=$1
    local pattern=$2
    local description=$3
    
    if grep -q "$pattern" "$file" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $description"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $description (在 $file 中未找到)"
        ((FAILED++))
    fi
}

# 1. 文件检查
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. 关键文件检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_file "Dockerfile" "Dockerfile"
check_file "nginx.conf" "Nginx 配置"
check_file "docker-compose.yml" "Docker Compose 配置"
check_file "mvu-generator/package.json" "Package.json"
check_file "mvu-generator/vite.config.js" "Vite 配置"

echo ""

# 2. 构建文件检查
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. 构建配置检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_content "mvu-generator/package.json" '"vue"' "Vue 3 依赖"
check_content "mvu-generator/package.json" '"vite"' "Vite 构建工具"
check_content "mvu-generator/package.json" '"build": "vite build"' "构建脚本"
check_content "mvu-generator/vite.config.js" "@vitejs/plugin-vue" "Vue 插件"
check_content "Dockerfile" "npm run build" "构建命令"
check_content "Dockerfile" "FROM nginx:alpine" "Nginx 镜像"

echo ""

# 3. Nginx 配置检查
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. Nginx 配置检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_content "nginx.conf" "try_files \$uri \$uri/ /index.html" "SPA 路由支持"
check_content "nginx.conf" "gzip on" "Gzip 压缩"
check_content "nginx.conf" "location /health" "健康检查端点"
check_content "nginx.conf" "Cache-Control" "缓存策略"

echo ""

# 4. Docker 环境检查
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. Docker 环境检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_command "docker" "Docker"
check_command "docker compose" "Docker Compose"

# 检查 Docker 守护进程
if docker ps &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker 守护进程运行正常"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Docker 守护进程未运行"
    ((FAILED++))
fi

# 检查磁盘空间
disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$disk_usage" -lt 80 ]; then
    echo -e "${GREEN}✓${NC} 磁盘空间充足 (使用率: ${disk_usage}%)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} 磁盘使用率较高 (${disk_usage}%)"
    ((WARNINGS++))
fi

echo ""

# 5. 端口检查
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. 端口可用性检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_port() {
    local port=$1
    local description=$2
    
    if ! netstat -tln 2>/dev/null | grep -q ":$port " && ! lsof -i ":$port" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $description (端口 $port 可用)"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} $description (端口 $port 可能被占用)"
        ((WARNINGS++))
    fi
}

# 如果 netstat 和 lsof 都不可用，跳过检查
if command -v netstat &> /dev/null || command -v lsof &> /dev/null; then
    check_port "80" "HTTP 端口"
    check_port "8080" "本地开发端口"
else
    echo -e "${YELLOW}⚠${NC} 无法检查端口（netstat/lsof 不可用）"
    ((WARNINGS++))
fi

echo ""

# 6. 可选项检查
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. 可选项检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f ".dockerignore" ]; then
    echo -e "${GREEN}✓${NC} .dockerignore 配置存在"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} .dockerignore 文件缺失（建议创建）"
    ((WARNINGS++))
fi

if [ -f "docs/DOCKER_DEPLOYMENT_GUIDE.md" ]; then
    echo -e "${GREEN}✓${NC} Docker 部署指南存在"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Docker 部署指南缺失"
    ((WARNINGS++))
fi

if [ -f "docker-compose.prod.yml" ]; then
    echo -e "${GREEN}✓${NC} 生产环境 Docker Compose 配置存在"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} 生产环境配置缺失（可选）"
    ((WARNINGS++))
fi

if [ -f "k8s-deployment.yaml" ]; then
    echo -e "${GREEN}✓${NC} Kubernetes 部署配置存在"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Kubernetes 部署配置缺失（可选）"
    ((WARNINGS++))
fi

echo ""

# 7. 可选的本地构建测试
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7. 本地构建测试（可选）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

read -p "是否执行本地镜像构建测试？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "开始构建镜像..."
    if docker build -t ranbo-play:verify --progress=plain . > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Docker 镜像构建成功"
        
        # 获取镜像大小
        image_size=$(docker images ranbo-play:verify --format "{{.Size}}")
        echo "  镜像大小: $image_size"
        
        ((PASSED++))
        
        # 清理测试镜像
        docker rmi ranbo-play:verify > /dev/null 2>&1
    else
        echo -e "${RED}✗${NC} Docker 镜像构建失败"
        echo "  请检查 Dockerfile 和源代码"
        ((FAILED++))
    fi
else
    echo "跳过构建测试"
fi

echo ""

# 总结
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "检查总结"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

total=$((PASSED + FAILED + WARNINGS))

echo -e "${GREEN}通过${NC}: $PASSED"
if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}警告${NC}: $WARNINGS"
fi
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}失败${NC}: $FAILED"
fi

echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✓ 项目已准备好进行 Docker 部署！${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    echo ""
    echo "后续步骤："
    echo "1. 本地测试："
    echo "   docker compose up -d"
    echo "   curl http://localhost:8080/health"
    echo ""
    echo "2. 构建生产镜像："
    echo "   docker build --build-arg VERSION=1.0.0 -t ranbo-play:1.0.0 ."
    echo ""
    echo "3. 推送到镜像仓库："
    echo "   docker tag ranbo-play:1.0.0 ghcr.io/ranbo12138/ranbo-play:1.0.0"
    echo "   docker push ghcr.io/ranbo12138/ranbo-play:1.0.0"
    echo ""
    
    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}✗ 项目检查未通过，请修复上述问题后重试${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 1
fi
