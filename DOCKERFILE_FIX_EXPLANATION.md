# Dockerfile npm 安装失败修复说明

## 问题描述

Docker 构建时 npm 依赖安装失败：
```
ERROR: failed to build: failed to solve: process "/bin/sh -c npm ci && npm cache clean --force" did not complete successfully: exit code: 1
```

## 问题根本原因

原始 Dockerfile 使用 `npm ci` 命令进行依赖安装，这在 Docker 环境中容易失败，主要原因包括：

### 1. npm ci 的严格性
- `npm ci`（Clean Install）是为 CI/CD 环境设计的
- 它要求 `package-lock.json` 与 `package.json` 精确匹配
- 任何版本差异都会导致安装失败

### 2. Peer Dependencies 冲突
- Monaco Editor 等大型依赖库中存在 peer dependencies 冲突
- `npm ci` 在遇到 peer dependencies 冲突时会强制失败
- 这些冲突在实际运行时通常不会造成问题

### 3. npm 缓存问题
- 在 Docker 中 npm 缓存可能损坏或不一致
- 原始代码将缓存清理与安装混在一个 RUN 命令中
- 如果先清理了缓存，再进行安装可能导致问题

## 修复方案

### 第一步：修复 npm 安装命令

将 Dockerfile 第 19-26 行从：
```dockerfile
# 安装项目依赖并清理缓存以减小镜像大小
RUN npm ci && npm cache clean --force
```

修改为：
```dockerfile
# 安装项目依赖
# 使用 npm install 而不是 npm ci，因为 npm ci 在处理 peer dependencies 冲突时更严格
# 添加 --legacy-peer-deps 标志以处理可能的依赖版本冲突（特别是 Monaco Editor 等大型库）
# 分开缓存清理步骤以避免缓存问题影响安装过程
RUN npm install --legacy-peer-deps

# 清理 npm 缓存以减小镜像大小
RUN npm cache clean --force
```

### 第二步：修复目录结构复制

将 Dockerfile 第 28-32 行从：
```dockerfile
# 复制源代码到容器中
COPY mvu-generator/ ./

# 构建生产版本 - 生成 dist 目录
RUN npm run build
```

修改为：
```dockerfile
# 复制源代码到容器中
# 复制 mvu-generator 的源代码
COPY mvu-generator/ ./

# 复制共享的 src 目录（包含 composables/plugins 等共享组件）
COPY src/ ../src/

# 构建生产版本 - 生成 dist 目录
RUN npm run build
```

**原因**：vite.config.js 中的路径别名 `@@` 指向 `../src`，这在本地开发中指向 `/home/engine/project/src`，但在 Docker 中工作目录是 `/app`，所以 `/app/../src` 必须存在。

### 修复的关键改进

1. **使用 npm install 替代 npm ci**
   - `npm install` 更灵活，允许依赖解析
   - 能自动处理版本范围和兼容性
   - 不会因为 peer dependencies 冲突而完全失败

2. **添加 --legacy-peer-deps 标志**
   - 允许安装具有 peer dependency 冲突的包
   - 特别适用于 Monaco Editor 等复杂依赖树
   - 在 npm 7+ 中这是推荐的做法

3. **分离 npm cache clean 命令**
   - 将缓存清理分开为独立的 RUN 命令
   - 避免缓存状态问题影响安装过程
   - 提高 Docker 构建的稳定性

## 验证

修复后的 Dockerfile：
- ✅ 成功完成 npm 依赖安装
- ✅ 处理 Monaco Editor 等复杂依赖
- ✅ 避免 peer dependencies 冲突导致的失败
- ✅ 减小最终镜像大小（通过缓存清理）

## Docker 构建命令

```bash
# 构建 Docker 镜像
docker build -t mvu-generator:latest .

# 运行容器
docker run -p 80:80 mvu-generator:latest

# 或使用 docker-compose
docker-compose up
```

## 推荐的最佳实践

1. 使用 `npm install` 而不是 `npm ci` 用于生产构建（更容易维护）
2. 始终包含 `--legacy-peer-deps` 以增强兼容性
3. 分开缓存清理命令以提高可靠性
4. 定期更新依赖版本以减少冲突

## 构建测试结果

### 成功的构建日志摘要
```
#10 [builder 4/7] RUN npm install --legacy-peer-deps
#10 25.26 added 367 packages, and audited 368 packages in 14s
#10 DONE 25.3s
...
#16 [builder 8/8] RUN npm run build
#16 42.21 ✓ 29 modules transformed.
#16 45.82 ✓ built in 5.41s
#16 DONE 45.9s
...
#19 naming to docker.io/library/mvu-test:v3 0.0s done
#19 DONE 1.6s
```

### 镜像信息
- 镜像大小: 89.8 MB
- Node.js 版本: node:20-alpine
- 构建状态: ✅ 成功

### 运行测试
- 容器启动: ✅ 成功
- HTTP 响应: ✅ 正常（返回 HTML 内容）
- 应用工作状态: ✅ 正常

## 相关文件修改

- **Dockerfile**: 修改了两个部分
  - 第 19-26 行: npm install 命令修改
  - 第 28-36 行: 添加 src 目录复制

- **package.json**: 未改动，依赖版本保持不变
- **package-lock.json**: 未改动，保持不变
- **vite.config.js**: 未改动，路径别名保持不变
