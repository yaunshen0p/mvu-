# GHCR 推送权限配置指南

> **目标**：按照本文档完成 GitHub Container Registry (GHCR) 推送权限配置，解决 `docker buildx push` 出现 `ERROR: denied: permission_denied: The requested installation does not exist` 的问题，并保证本地与自动化流程都能成功发布镜像。

---

## 0. 背景与准备

- GHCR 镜像命名规范：`ghcr.io/<OWNER>/<IMAGE_NAME>:<TAG>`，全部小写且 `<OWNER>` 必须是你的 GitHub 用户名或组织名。
- `permission_denied` 错误常见原因：
  - 使用的令牌（token）没有 `write:packages` 权限；
  - 推送到组织仓库但未被授予 `packages` 权限；
  - 在 GitHub Actions 的 Pull Request 任务中使用了 fork 仓库的令牌；
  - 镜像命名与登录账号不匹配。
- 先确认本地已安装 Docker（建议开启 BuildKit）并能访问 `ghcr.io`。

---

## 1. 创建 Personal Access Token (PAT)

GitHub 提供两种 PAT：`Tokens (classic)` 与 `Fine-grained tokens`。GHCR 目前仍推荐使用 **经典 Token**，因为其权限范围覆盖 Packages。

### 1.1 打开 PAT 创建页面

1. 登录 GitHub。
2. 点击右上角头像 → **Settings**。
3. 左侧菜单最底部进入 **Developer settings**。
4. 选择 **Personal access tokens → Tokens (classic)**。
5. 点击右上角 **Generate new token (classic)**。

> 提示：若需要截图，可在此页面截图保存以供团队成员参考。

### 1.2 填写信息与权限范围

1. **Note**：填写令牌名称，例如 `GHCR Push Token`。
2. **Expiration**：选择令牌失效时间（推荐 30~90 天，长期需配合轮转机制）。
3. **Scopes**：勾选以下权限：
   - `read:packages`
   - `write:packages`
   - `delete:packages`（可选，仅在删除镜像时需要）
   - `repo`（用于私有仓库或在 Actions 中访问代码）
4. 点击底部 **Generate token**。

### 1.3 保存与管理 Token

- GitHub 只会显示一次完整的 token，生成后立即复制，保存到安全的密码管理器。
- 若计划在 GitHub Actions 中使用，请将 token 存入仓库或组织的 Secret：
  - 进入仓库：**Settings → Secrets and variables → Actions → New repository secret**，名称建议为 `GHCR_PAT`。
- 为安全起见，定期轮换 token，并记录生成与到期时间。

---

## 2. 配置 Docker 登录凭证

### 2.1 使用环境变量

```bash
export GHCR_USERNAME="<GitHub 用户名或组织名>"
export GHCR_PAT="<刚生成的 personal access token>"
```

> 将 `<GitHub 用户名或组织名>`、`<刚生成的 personal access token>` 替换成实际值。

### 2.2 登录 GHCR

```bash
# 推荐使用管道方式，避免 token 出现在命令历史中
echo "$GHCR_PAT" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin
```

或手动输入：

```bash
docker login ghcr.io -u "$GHCR_USERNAME"
# Docker 将提示输入密码，此时粘贴 GHCR_PAT
```

成功后会输出 `Login Succeeded`。

### 2.3 验证登录状态

```bash
docker info | grep 'Registry Mirrors' -n
# 或查看当前登录凭证
docker credentials ls | grep ghcr
```

若要退出登录：

```bash
docker logout ghcr.io
```

---

## 3. 手动构建与推送镜像

### 3.1 准备镜像标识

```bash
export IMAGE_NAME="ghcr.io/<owner>/<repo-name>:<tag>"
# 示例： ghcr.io/ranbo12138/ranbo-play:latest
```

确保 `<owner>` 与登录的 GitHub 帐号/组织一致，镜像名称全部小写。

### 3.2 使用 Docker Buildx 构建

```bash
# 可选：为多架构准备 builder
# docker buildx create --use --name ghcr-builder

# 构建并加载到本地
DOCKER_BUILDKIT=1 docker buildx build \
  --platform linux/amd64 \
  --tag "$IMAGE_NAME" \
  --file Dockerfile \
  .
```

### 3.3 推送到 GHCR

```bash
# 方式 1：先 build 再手动 push（适用于单架构）
docker push "$IMAGE_NAME"

# 方式 2：构建时直接 push（多平台推荐）
DOCKER_BUILDKIT=1 docker buildx build \
  --platform linux/amd64 \
  --tag "$IMAGE_NAME" \
  --file Dockerfile \
  --push \
  .
```

### 3.4 发布后自检

```bash
# 1. 查看镜像摘要
docker buildx imagetools inspect "$IMAGE_NAME"

# 2. 重新拉取确认权限正常
docker pull "$IMAGE_NAME"
```

若命令成功完成，表示已拥有推送权限。

---

## 4. GitHub Actions 自动化推送（可选）

GitHub Actions 可以自动构建并推送镜像，应确保：

1. 仓库 Secret 中存在 `GHCR_PAT`（PAT 需具备 `write:packages` 权限）。
2. Workflow 文件中声明 `permissions: packages: write`。若在组织下，还需管理员允许 GitHub Actions 访问 GHCR。
3. 在 Pull Request 场景下，来自 fork 的运行不具备写权限，此时 workflow 会自动跳过推送步骤。

### 4.1 范例 workflow

以下示例可保存为 `.github/workflows/ci-ghcr.yml`（仓库中已有类似配置，可按需调整）：

```yaml
name: GHCR Publish

on:
  push:
    branches:
      - main
      - release/*
    tags:
      - 'v*'
  workflow_dispatch:

permissions:
  contents: read
  packages: write

jobs:
  docker-build-and-push:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.repository_owner }}
          password: ${{ secrets.GHCR_PAT }}

      - name: Extract metadata (tags, labels)
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository_owner }}/ranbo-play

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          file: Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
```

### 4.2 常见配置说明

- **`username`**：推荐使用 `${{ github.repository_owner }}`，保证与仓库所有者一致。
- **`password`**：可使用 `secrets.GITHUB_TOKEN`（在同仓库或同组织推送时，GitHub 自动授予 `packages: write` 权限）。若推送目标与仓库所有者不同、或需要跨组织，必须改用 PAT。
- **触发策略**：可根据需要限制为 `main` 或 `release/*` 分支，并在 tag 发布时 push 正式版本。
- **多架构**：在 `docker/build-push-action` 中添加 `platforms: linux/amd64,linux/arm64`。

---

## 5. 常见问题排查

| 现象 | 原因 | 解决方案 |
| --- | --- | --- |
| `permission_denied: The requested installation does not exist` | 使用 `GITHUB_TOKEN` 执行推送，但当前 Actions 运行来自 fork 或目标仓库不匹配 | 改用具备 `write:packages` 权限的 PAT；或在官方仓库内运行推送流程 |
| `unauthorized: authentication required` | 未登录、PAT 过期或权限不足 | 重新执行 `docker login ghcr.io`，检查 PAT 是否具备 `write:packages`，必要时重新生成 |
| `denied: permission_denied: requested scope is invalid` | PAT 权限缺少 `write:packages` 或 `repo`（私有仓库） | 修改或重新生成 PAT，补全所需 scope |
| `name unknown: requested access to the resource is denied` | 镜像命名不符合 GHCR 规则（大小写/路径错误），或 pushing 到错误命名空间 | 确认镜像名格式 `ghcr.io/<owner>/<image>`，全部小写且 `<owner>` 与登录账号一致 |
| Actions 中 `docker/login-action` 步骤失败 | Secrets 未配置或拼写错误 | 在仓库 `Settings → Secrets and variables → Actions` 中重新添加，并检查 workflow 引用名 |
| 推送成功但仓库中不可见 | 镜像默认是私有的 | 前往 GitHub 仓库 **Packages** 页面，将需要公开的镜像设置为 public |

### 5.1 网络与 CLI 检查

```bash
# 验证 token 可用性
curl -H "Authorization: Bearer $GHCR_PAT" https://ghcr.io/v2/ -I

# 列出当前可见仓库（有限权）
curl -H "Authorization: Bearer $GHCR_PAT" https://ghcr.io/v2/token?service=ghcr.io\&scope=repository:<owner>/<image>:pull
```

若返回 200/OK 或包含有效 `token` 字段，说明权限可用。

---

## 6. 权限验证检查清单

- [ ] 已创建 PAT 并安全存储，具备 `read:packages`、`write:packages`（必要时 `delete:packages`、`repo`）。
- [ ] 成功执行 `docker login ghcr.io`，输出 `Login Succeeded`。
- [ ] 手动执行 `docker push ghcr.io/<owner>/<image>:<tag>` 无报错。
- [ ] 在 GitHub Packages 页面能看到刚推送的镜像。
- [ ] Actions workflow（如启用）具备 `packages: write` 权限并能成功运行 `docker/build-push-action` 步骤。
- [ ] 针对组织仓库，管理员已授予成员/机器人 `Packages` 权限。
- [ ] 定期轮换 PAT，并记录到期提醒。

---

## 7. 附录：快速命令汇总

```bash
# 生成随机 tag（示例）
export IMAGE_TAG="$(date +%Y%m%d-%H%M%S)"
export IMAGE_NAME="ghcr.io/<owner>/<repo>:${IMAGE_TAG}"

# 构建并推送（单架构）
DOCKER_BUILDKIT=1 docker build \
  -t "$IMAGE_NAME" \
  -f Dockerfile \
  .

docker push "$IMAGE_NAME"

# Buildx 多架构推送
DOCKER_BUILDKIT=1 docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag "$IMAGE_NAME" \
  --file Dockerfile \
  --push \
  .

# 删除本地登录信息
docker logout ghcr.io
```

> 若需扩展为 Helm、Kubernetes 或其他部署工具，可在成功推送后引用镜像 `ghcr.io/<owner>/<repo>:<tag>`。

---

通过以上步骤，即便是初次接触容器发布的新手也能顺利完成 GHCR 登录、推送与自动化配置。如仍遇到问题，可结合第 5 节排查项逐条检查，或将执行日志与错误信息分享给团队进行协助。
