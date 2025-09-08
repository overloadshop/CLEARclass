# 班级管理系统安全验证模块

## 概述

安全验证模块为班级管理系统提供敏感操作的密码保护功能。当用户在设置页面开启"敏感操作验证"后，系统会在执行重要操作前要求密码验证。

## 功能特性

- **密码保护**: 使用专属单向哈希算法存储密码
- **敏感操作验证**: 自动拦截需要验证的操作
- **用户友好**: 提供美观的密码输入对话框
- **全局可用**: 可在任何页面中使用
- **自动样式**: 自动添加必要的CSS样式

## 文件结构

```
security/
├── security-system.js    # 核心安全系统模块
└── README.md            # 使用说明文档
```

## 使用方法

### 1. 引入安全系统

在需要使用安全验证的页面中引入安全系统：

```html
<script src="../security/security-system.js"></script>
```

### 2. 基本使用

#### 检查是否启用安全验证

```javascript
if (securitySystem.isSecurityEnabled()) {
    console.log('安全验证已启用');
}
```

#### 执行敏感操作验证

```javascript
// 异步方式（推荐）
async function deleteAllData() {
    const verified = await securitySystem.verifySensitiveOperation('删除所有数据');
    if (verified) {
        // 执行删除操作
        console.log('验证通过，执行删除操作');
    } else {
        console.log('验证失败或用户取消');
    }
}

// 回调方式
function exportData() {
    securitySystem.verifySensitiveOperation('导出数据').then(verified => {
        if (verified) {
            // 执行导出操作
            console.log('验证通过，执行导出操作');
        }
    });
}
```

### 3. 高级用法

#### 直接密码验证

```javascript
// 验证密码
const isValid = securitySystem.verifyPassword('用户输入的密码');

// 检查是否已设置密码
const hasPassword = securitySystem.hasPassword();
```

#### 获取安全设置

```javascript
const settings = securitySystem.getSecuritySettings();
console.log('安全验证状态:', settings.enabled);
```

## 集成示例

### 示例1: 数据管理页面

```html
<!DOCTYPE html>
<html>
<head>
    <title>数据管理</title>
</head>
<body>
    <button onclick="deleteAllData()">删除所有数据</button>
    <button onclick="exportSensitiveData()">导出敏感数据</button>
    
    <script src="../security/security-system.js"></script>
    <script>
        async function deleteAllData() {
            const verified = await securitySystem.verifySensitiveOperation('删除所有数据');
            if (verified) {
                // 执行删除操作
                localStorage.clear();
                alert('数据已删除');
            }
        }
        
        async function exportSensitiveData() {
            const verified = await securitySystem.verifySensitiveOperation('导出敏感数据');
            if (verified) {
                // 执行导出操作
                console.log('开始导出敏感数据...');
            }
        }
    </script>
</body>
</html>
```

### 示例2: 系统设置页面

```javascript
// 修改重要设置前验证
async function changeSystemConfig() {
    const verified = await securitySystem.verifySensitiveOperation('修改系统配置');
    if (verified) {
        // 修改配置
        updateSystemSettings();
    }
}

// 重置系统前验证
async function resetSystem() {
    const verified = await securitySystem.verifySensitiveOperation('重置系统');
    if (verified) {
        // 重置系统
        performSystemReset();
    }
}
```

## 需要验证的操作类型

建议对以下类型的操作启用安全验证：

1. **数据删除**: 删除班级信息、学生数据等
2. **数据导出**: 导出包含敏感信息的数据
3. **系统重置**: 重置系统设置或清空数据
4. **配置修改**: 修改重要的系统配置
5. **用户管理**: 添加、删除、修改用户权限
6. **备份恢复**: 恢复备份数据

## 安全特性

### 密码存储

- 使用专属哈希算法，不可逆向解密
- 添加系统特定的盐值
- 多轮哈希变换增强安全性

### 验证流程

1. 检查是否启用安全验证
2. 如未启用，直接通过
3. 如已启用，显示密码输入对话框
4. 验证密码正确性
5. 返回验证结果

### 用户体验

- 美观的模态对话框
- 支持回车键快速确认
- 自动聚焦密码输入框
- 友好的错误提示

## 注意事项

1. **依赖关系**: 如果页面使用了吐司提示系统，请确保在安全系统之前引入
2. **样式冲突**: 安全系统会自动添加样式，如有冲突请调整
3. **密码强度**: 建议用户设置至少4位的密码
4. **浏览器兼容**: 支持现代浏览器，使用了ES6+语法

## API 参考

### SecuritySystem 类

#### 方法

- `isSecurityEnabled()`: 检查是否启用安全验证
- `verifySensitiveOperation(operationName)`: 执行敏感操作验证
- `verifyPassword(password)`: 验证密码
- `hasPassword()`: 检查是否已设置密码
- `setPassword(password)`: 设置密码
- `getSecuritySettings()`: 获取安全设置
- `saveSecuritySettings(settings)`: 保存安全设置

#### 全局实例

```javascript
// 全局可用的安全系统实例
securitySystem
```

## 更新日志

### v1.0.0 (2025-01-24)
- 初始版本发布
- 基础密码验证功能
- 敏感操作保护
- 自动样式添加
- 用户友好的对话框界面