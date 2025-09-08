# 弹窗系统 API 使用说明

本弹窗系统包含三个核心组件：Toast吐司提示、Modal模态框、Confirm确认对话框。所有组件都采用现代化设计，完全兼容原始demo.html样式。

## 📋 快速开始

### 引入文件
```html
<!-- 在HTML页面中引入以下文件 -->
<!-- 引入样式文件 -->
<link rel="stylesheet" href="popup-system/popup-system.css">

<!-- 引入JavaScript文件 -->
<script src="popup-system/toast.js"></script>
<script src="popup-system/modal.js"></script>
<script src="popup-system/confirm.js"></script>
```

**注意：** 
- `popup-system.css` 包含了弹窗系统的所有样式，采用苹果风格设计
- 样式文件必须在JavaScript文件之前引入
- 如果你的HTML文件在其他文件夹中，请相应调整路径（如：`../popup-system/popup-system.css`）

## 🍞 Toast 吐司提示

### 基础用法
```javascript
// 基础调用（完全兼容原始demo.html接口）
showToast('操作成功！', 'success');
showToast('操作失败！', 'error');
showToast('请注意！', 'warning');
showToast('提示信息', 'info');

// 带标题和自定义持续时间
showToast('数据已保存', 'success', '操作成功', 5000);
```

### 现代化调用方式
```javascript
// 使用toast对象
toast.success('操作成功！');
toast.error('操作失败！');
toast.warning('请注意！');
toast.info('提示信息');

// 带参数调用
toast.success('数据已保存', '操作成功', 5000);
toast.error('网络错误', '连接失败', 0); // 0表示不自动关闭
```

### 高级用法
```javascript
// 对象参数方式（支持更多配置）
toast.show({
    message: '🎉 自定义Toast，点击我试试！',
    type: 'success',
    title: '自定义标题',
    duration: 5000,
    onClick: () => {
        console.log('Toast被点击了！');
    },
    onClose: () => {
        console.log('Toast关闭了！');
    }
});

// 清除所有Toast
toast.clear();
```

### Toast 类型
- `success` - 成功提示（绿色边框）
- `error` - 错误提示（红色边框）
- `warning` - 警告提示（黄色边框）
- `info` - 信息提示（蓝色边框）

## 🪟 Modal 模态框

### 基础对话框
```javascript
// 警告框
modal.alert('这是一个警告信息！').then(() => {
    console.log('用户点击了确定');
});

// 确认框
modal.confirm('确定要删除这个项目吗？').then(result => {
    if (result) {
        console.log('用户确认删除');
    } else {
        console.log('用户取消删除');
    }
});

// 输入框
modal.prompt('请输入您的姓名：', '默认值').then(result => {
    if (result !== null) {
        console.log('用户输入了：', result);
    } else {
        console.log('用户取消了输入');
    }
});
```

### 自定义模态框
```javascript
// 自定义内容的模态框
modal.show({
    title: '自定义标题',
    content: `
        <div style="padding: 20px;">
            <p>这是自定义内容</p>
            <input type="text" id="customInput" placeholder="请输入内容" style="width: 100%; padding: 8px; margin: 10px 0;">
        </div>
    `,
    size: 'medium', // small, medium, large
    showClose: true,
    onConfirm: () => {
        const value = document.getElementById('customInput').value;
        console.log('获取到输入值：', value);
        return true; // 返回true关闭模态框
    },
    onCancel: () => {
        console.log('用户取消了');
    }
});
```

### Modal 配置选项
- `title` - 标题
- `content` - 内容（支持HTML）
- `size` - 大小：'small', 'medium', 'large'
- `showClose` - 是否显示关闭按钮
- `confirmText` - 确认按钮文本
- `cancelText` - 取消按钮文本
- `onConfirm` - 确认回调
- `onCancel` - 取消回调

## ✅ Confirm 确认对话框

### 基础确认
```javascript
// 基础确认
confirm.show('确定要执行这个操作吗？').then(result => {
    if (result) {
        console.log('用户确认了');
    }
});
```

### 预设类型
```javascript
// 警告确认
confirm.warning('这个操作可能有风险，确定继续吗？').then(result => {
    // 处理结果
});

// 错误确认
confirm.error('发生了错误，是否重试？').then(result => {
    // 处理结果
});

// 删除确认
confirm.delete('确定要删除这个项目吗？此操作不可撤销。').then(result => {
    if (result) {
        toast.success('项目已删除！');
    }
});

// 保存确认
confirm.save('是否保存当前更改？').then(result => {
    // 处理结果
});

// 退出确认
confirm.exit('有未保存的更改，确定要退出吗？').then(result => {
    // 处理结果
});
```

### 自定义确认框
```javascript
confirm.show({
    title: '自定义确认',
    message: '这是自定义的确认对话框',
    type: 'warning', // success, error, warning, info, question
    confirmText: '继续',
    cancelText: '取消',
    showCancel: true,
    maskClosable: false, // 点击遮罩是否关闭
    onConfirm: () => {
        console.log('确认回调');
    },
    onCancel: () => {
        console.log('取消回调');
    }
}).then(result => {
    console.log('最终结果：', result);
});
```

### Confirm 预设类型
- `warning()` - 警告确认（黄色图标）
- `error()` - 错误确认（红色图标）
- `info()` - 信息确认（蓝色图标）
- `success()` - 成功确认（绿色图标）
- `question()` - 询问确认（问号图标）
- `delete()` - 删除确认（删除图标）
- `save()` - 保存确认（保存图标）
- `exit()` - 退出确认（退出图标）

## 🔄 组合使用示例

### 完整的操作流程
```javascript
// 1. 确认操作
confirm.delete('确定要删除这个文件吗？').then(result => {
    if (result) {
        // 2. 执行删除操作
        deleteFile().then(() => {
            // 3. 显示成功提示
            toast.success('文件删除成功！');
        }).catch(error => {
            // 4. 显示错误提示
            toast.error('删除失败：' + error.message);
        });
    }
});

// 表单提交流程
function submitForm() {
    // 1. 获取表单数据
    const formData = getFormData();
    
    // 2. 验证数据
    if (!validateForm(formData)) {
        toast.warning('请填写完整的表单信息！');
        return;
    }
    
    // 3. 确认提交
    confirm.save('确定要保存这些更改吗？').then(result => {
        if (result) {
            // 4. 提交数据
            submitData(formData).then(() => {
                toast.success('保存成功！');
            }).catch(error => {
                toast.error('保存失败：' + error.message);
            });
        }
    });
}
```

### 批量操作示例
```javascript
function batchOperation() {
    confirm.warning('即将执行批量操作，这可能需要一些时间，确定继续吗？').then(result => {
        if (result) {
            toast.info('开始执行批量操作...');
            
            // 执行批量操作
            performBatchOperation().then(() => {
                toast.success('批量操作完成！');
            }).catch(error => {
                toast.error('批量操作失败：' + error.message);
            });
        }
    });
}
```

## 🎨 样式自定义

### Toast 样式自定义
```css
/* 自定义Toast容器位置 */
.toast-container {
    top: 80px !important; /* 调整顶部距离 */
    right: 30px !important; /* 调整右侧距离 */
}

/* 自定义Toast样式 */
.toast {
    min-width: 350px !important; /* 调整最小宽度 */
    font-size: 15px !important; /* 调整字体大小 */
}

/* 自定义成功类型样式 */
.toast.success {
    border-left-color: #00C851 !important; /* 自定义成功颜色 */
}
```

## 🔧 兼容性说明

### 向后兼容
本弹窗系统完全兼容原始demo.html中的调用方式：

```javascript
// 原始调用方式仍然有效
showToast('消息', 'success', '标题', 3000);
showMessage('消息', 'info');
```

### 现代化调用
推荐使用新的对象化调用方式，功能更强大：

```javascript
// 推荐的现代化调用
toast.success('消息');
modal.confirm('确认信息');
confirm.delete('删除确认');
```

## 📝 注意事项

1. **引入顺序**：请按照 popup-system/toast.js → popup-system/modal.js → popup-system/confirm.js 的顺序引入文件
2. **样式冲突**：如果页面中有其他CSS框架，可能需要调整z-index值
3. **移动端适配**：所有组件都支持移动端，会自动适配屏幕大小
4. **性能考虑**：Toast会自动管理实例数量，避免内存泄漏
5. **浏览器兼容**：支持所有现代浏览器，IE11+

## 🚀 最佳实践

1. **统一使用**：在项目中统一使用一种调用方式（推荐现代化方式）
2. **合理时长**：Toast显示时长建议3-5秒，重要信息可设为0（手动关闭）
3. **用户体验**：避免同时显示过多Toast，使用toast.clear()清理
4. **错误处理**：重要操作前使用Confirm确认，操作后用Toast反馈
5. **内容简洁**：Toast和Confirm的文本要简洁明了，避免过长

## 📚 实际应用案例

### 作业管理页面集成示例

在班级管理系统的作业页面中，我们完整集成了所有弹窗组件：

```html
<!-- 引入弹窗系统 -->
<link rel="stylesheet" href="../popup-system/popup-system.css">
<script src="../popup-system/toast.js"></script>
<script src="../popup-system/modal.js"></script>
<script src="../popup-system/confirm.js"></script>
```

```javascript
// Toast通知使用
toast.warning('请选择科目');  // 表单验证
toast.success('作业添加成功');  // 操作成功反馈

// Modal弹窗使用
function showAddHomeworkModal() {
    // 重置表单数据
    resetForm();
    
    // 显示模态框
    showModal({
        element: document.getElementById('addHomeworkModal')
    });
}

function closeAddHomeworkModal() {
    closeModal();
}

// Confirm确认对话框使用
function deleteHomework(id) {
    showConfirm({
        title: '确认删除',
        message: '确定要删除这项作业吗？',
        confirmText: '删除',
        cancelText: '取消'
    }).then(confirmed => {
        if (confirmed) {
            // 执行删除操作
            performDelete(id);
            toast.success('作业删除成功');
        }
    });
}
```

### 集成优势

1. **统一体验**：所有弹窗组件风格一致，符合苹果设计规范
2. **功能完整**：Toast反馈 + Modal表单 + Confirm确认，覆盖所有交互场景
3. **代码简洁**：替换原生alert/confirm，代码更优雅
4. **自动管理**：无需手动处理弹窗层级、外部点击关闭等细节

---

如有问题或需要更多功能，请参考test.html中的完整示例代码。