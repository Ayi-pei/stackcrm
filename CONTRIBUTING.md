# 贡献指南

感谢您对云聚CRM项目的关注！我们欢迎所有形式的贡献，包括但不限于代码、文档、测试、反馈等。

## 🤝 如何贡献

### 报告问题

如果您发现了bug或有功能建议，请：

1. 检查 [Issues](../../issues) 确保问题未被报告
2. 创建新的 Issue，包含：
   - 清晰的标题和描述
   - 重现步骤（如果是bug）
   - 期望的行为
   - 实际的行为
   - 环境信息（操作系统、浏览器、Node.js版本等）
   - 相关的错误日志或截图

### 提交代码

1. **Fork 项目**
   ```bash
   git clone https://github.com/your-username/yunju-crm.git
   cd yunju-crm
   ```

2. **创建功能分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **安装依赖**
   ```bash
   # 前端依赖
   npm install
   
   # 后端依赖
   cd server
   npm install
   ```

4. **进行开发**
   - 遵循现有的代码风格
   - 添加必要的测试
   - 更新相关文档

5. **提交更改**
   ```bash
   git add .
   git commit -m "feat: 添加新功能描述"
   ```

6. **推送到远程仓库**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **创建 Pull Request**

## 📝 代码规范

### 提交信息规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

示例：
```
feat: 添加密钥批量管理功能
fix: 修复聊天消息时间显示问题
docs: 更新API文档
```

### 代码风格

**TypeScript/JavaScript:**
- 使用 2 空格缩进
- 使用单引号
- 行尾不加分号
- 使用 camelCase 命名变量和函数
- 使用 PascalCase 命名组件和类
- 使用 UPPER_SNAKE_CASE 命名常量

**React 组件:**
- 使用函数组件和 Hooks
- 组件文件使用 PascalCase 命名
- 导出组件使用命名导出

**CSS/样式:**
- 优先使用 Tailwind CSS 类
- 自定义样式使用 CSS Modules 或 styled-components
- 遵循 BEM 命名规范（如果使用传统CSS）

## 🧪 测试

在提交代码前，请确保：

1. **运行现有测试**
   ```bash
   npm test
   ```

2. **添加新测试**
   - 为新功能添加单元测试
   - 为API端点添加集成测试
   - 确保测试覆盖率不降低

3. **手动测试**
   - 在不同浏览器中测试
   - 测试响应式设计
   - 验证所有用户角色的功能

## 📚 文档

### 更新文档

当您的更改涉及以下内容时，请更新相应文档：

- API 变更 → 更新 API 文档
- 新功能 → 更新用户指南
- 配置变更 → 更新配置文档
- 部署变更 → 更新部署指南

### 文档规范

- 使用清晰、简洁的语言
- 提供代码示例
- 包含截图（如果适用）
- 保持文档与代码同步

## 🔍 代码审查

所有的 Pull Request 都需要经过代码审查：

1. **自我审查**
   - 检查代码质量
   - 确保测试通过
   - 验证文档更新

2. **同行审查**
   - 至少需要一个维护者的批准
   - 解决所有审查意见
   - 确保CI/CD检查通过

## 🚀 发布流程

1. **版本号规范**
   - 遵循 [Semantic Versioning](https://semver.org/)
   - MAJOR.MINOR.PATCH 格式

2. **发布检查清单**
   - [ ] 所有测试通过
   - [ ] 文档已更新
   - [ ] 变更日志已更新
   - [ ] 版本号已更新

## 💬 社区

- **讨论**: 使用 GitHub Discussions 进行技术讨论
- **问题**: 使用 GitHub Issues 报告问题
- **邮件**: 联系维护者 dev@yunju-crm.com

## 📄 许可证

通过贡献代码，您同意您的贡献将在 [MIT License](LICENSE) 下许可。

---

再次感谢您的贡献！🎉