# Aurora 包管理器

为 **Aurora Austral** 语言设计的高性能、独立包管理器，**零外部依赖**。

## 安装

```bash
npm install -g @aurora.purecore.codes/latest@1.1.0
```

**注意：** 此包完全独立。它仅使用 Node.js 原生 API（`fetch`, `fs`, `path`, `os`, `child_process`）。

## 主要命令

- `aurora init`: 初始化新项目并配置本地编译器。
- `aurora install <包名>`: 从官方仓库下载、编译并测试包。
- `aurora find <搜索词>`: 在包名和 README.md 内容中进行智能搜索。
- `aurora list`: 列出可用或本地安装的包。
- `aurora update`: 更新项目依赖项。

## 标准库集成
管理器会自动检测 `aurora-austral-standard-lib` 的位置，以确保所有包都能针对本地版本的标准库正确编译。

## 许可证
Apache-2.0
