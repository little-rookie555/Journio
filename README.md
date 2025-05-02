旅记——记录世界，连结每一段旅程。

## 项目结构

项目采用包含两个子项目：

- Journio-admin: 后台管理系统
- Journio-app: 用户端应用

## 环境要求

- Node.js >= 18
- npm >= 9

## 开始使用

### 1. 安装依赖

首先在根目录安装公共依赖：

```bash
npm install
```

然后分别安装子项目依赖：

```bash
cd Journio-admin && npm install
cd ../Journio-app && npm install
```

### 2. 开发环境配置

项目使用了以下工具来保证代码质量：

- ESLint: 代码质量检查
- Prettier: 代码格式化
- Husky: Git 钩子管理
- Commitlint: 提交信息规范检查

VS Code 推荐配置：

1. 安装插件：
   - ESLint
   - Prettier
2. 启用保存时自动格式化

### 3. 开发命令

在各子项目目录下：

```bash
# 启动开发服务器
npm run dev

# 代码检查
npm run lint

# 构建生产版本
npm run build
```

### 4. Git 提交规范

项目使用 Conventional Commits 规范，提交格式：

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

提交类型（type）：

- feat: 新功能
- fix: 修复
- docs: 文档更新
- style: 代码格式（不影响代码运行的变动）
- refactor: 重构
- perf: 性能优化
- test: 测试
- chore: 构建过程或辅助工具的变动
- revert: 回滚

### 5. 项目结构说明

```
Journio/
├── Journio-admin/        # 后台管理系统
├── Journio-app/          # 用户端应用
├── .husky/               # Git 钩子配置
├── .prettierrc          # Prettier 配置
├── commitlint.config.js # Commitlint 配置
└── package.json         # 工作区配置
```

## 注意事项

1. 提交代码前会自动进行代码格式化和 lint 检查
2. 确保提交信息符合规范，否则提交会被拒绝
3. 建议安装推荐的插件
