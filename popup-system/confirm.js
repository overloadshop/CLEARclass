/**
 * 确认对话框系统
 * 提供丰富的确认场景和自定义按钮支持
 */

class ConfirmSystem {
    constructor() {
        this.init();
    }

    init() {
        this.addBaseStyles();
    }

    addBaseStyles() {
        if (document.getElementById('confirm-base-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'confirm-base-styles';
        style.textContent = `
            .confirm-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .confirm-overlay.show {
                opacity: 1;
            }
            
            .confirm-dialog {
                background: white;
                border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                max-width: 90vw;
                min-width: 320px;
                max-width: 480px;
                transform: scale(0.9) translateY(-20px);
                transition: transform 0.3s ease;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .confirm-overlay.show .confirm-dialog {
                transform: scale(1) translateY(0);
            }
            
            .confirm-header {
                padding: 24px 24px 16px;
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .confirm-icon {
                font-size: 24px;
                flex-shrink: 0;
            }
            
            .confirm-icon.warning { color: #faad14; }
            .confirm-icon.error { color: #ff4d4f; }
            .confirm-icon.info { color: #1890ff; }
            .confirm-icon.success { color: #52c41a; }
            .confirm-icon.question { color: #722ed1; }
            
            .confirm-title {
                font-size: 16px;
                font-weight: 600;
                color: #333;
                margin: 0;
                line-height: 1.4;
            }
            
            .confirm-content {
                padding: 0 24px 24px;
                color: #666;
                font-size: 14px;
                line-height: 1.6;
                word-break: break-word;
            }
            
            .confirm-footer {
                padding: 0 24px 24px;
                display: flex;
                justify-content: flex-end;
                gap: 8px;
            }
            
            .confirm-btn {
                padding: 8px 16px;
                border: 1px solid #d9d9d9;
                border-radius: 4px;
                background: white;
                color: #333;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
                min-width: 70px;
                outline: none;
            }
            
            .confirm-btn:hover {
                border-color: #40a9ff;
                color: #40a9ff;
            }
            
            .confirm-btn.primary {
                background: #1890ff;
                border-color: #1890ff;
                color: white;
            }
            
            .confirm-btn.primary:hover {
                background: #40a9ff;
                border-color: #40a9ff;
            }
            
            .confirm-btn.danger {
                background: #ff4d4f;
                border-color: #ff4d4f;
                color: white;
            }
            
            .confirm-btn.danger:hover {
                background: #ff7875;
                border-color: #ff7875;
            }
            
            .confirm-btn.success {
                background: #52c41a;
                border-color: #52c41a;
                color: white;
            }
            
            .confirm-btn.success:hover {
                background: #73d13d;
                border-color: #73d13d;
            }
            
            .confirm-btn.warning {
                background: #faad14;
                border-color: #faad14;
                color: white;
            }
            
            .confirm-btn.warning:hover {
                background: #ffc53d;
                border-color: #ffc53d;
            }
            
            @media (max-width: 768px) {
                .confirm-dialog {
                    margin: 20px;
                    max-width: calc(100vw - 40px);
                    min-width: auto;
                }
                
                .confirm-header, .confirm-content, .confirm-footer {
                    padding-left: 16px;
                    padding-right: 16px;
                }
                
                .confirm-footer {
                    flex-direction: column-reverse;
                }
                
                .confirm-btn {
                    width: 100%;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 显示确认对话框
     * @param {Object} options - 配置选项
     * @param {string} options.title - 标题
     * @param {string} options.content - 内容
     * @param {string} options.type - 类型: warning, error, info, success, question
     * @param {Array} options.buttons - 按钮配置
     * @param {boolean} options.maskClosable - 点击遮罩是否关闭
     * @param {Function} options.onClose - 关闭回调
     */
    show(options = {}) {
        return new Promise((resolve) => {
            const config = {
                title: '确认',
                content: '确定要执行此操作吗？',
                type: 'warning',
                buttons: [
                    { text: '取消', onClick: () => resolve(false) },
                    { text: '确定', type: 'primary', onClick: () => resolve(true) }
                ],
                maskClosable: true,
                onClose: () => resolve(false),
                ...options
            };

            const dialog = this.createDialog(config, resolve);
            this.showDialog(dialog);
        });
    }

    createDialog(config, resolve) {
        const overlay = document.createElement('div');
        overlay.className = 'confirm-overlay';
        
        const dialog = document.createElement('div');
        dialog.className = 'confirm-dialog';
        
        // 创建头部
        const header = this.createHeader(config);
        dialog.appendChild(header);
        
        // 创建内容
        const content = this.createContent(config);
        dialog.appendChild(content);
        
        // 创建底部
        const footer = this.createFooter(config, overlay, resolve);
        dialog.appendChild(footer);
        
        overlay.appendChild(dialog);
        
        // 绑定事件
        this.bindEvents(overlay, config, resolve);
        
        return overlay;
    }

    createHeader(config) {
        const header = document.createElement('div');
        header.className = 'confirm-header';
        
        // 图标
        const icon = document.createElement('div');
        icon.className = `confirm-icon ${config.type}`;
        icon.innerHTML = this.getTypeIcon(config.type);
        header.appendChild(icon);
        
        // 标题
        const title = document.createElement('h3');
        title.className = 'confirm-title';
        title.textContent = config.title;
        header.appendChild(title);
        
        return header;
    }

    createContent(config) {
        const content = document.createElement('div');
        content.className = 'confirm-content';
        
        if (typeof config.content === 'string') {
            content.innerHTML = config.content;
        } else if (config.content instanceof HTMLElement) {
            content.appendChild(config.content);
        }
        
        return content;
    }

    createFooter(config, overlay, resolve) {
        const footer = document.createElement('div');
        footer.className = 'confirm-footer';
        
        config.buttons.forEach((btnConfig, index) => {
            const btn = document.createElement('button');
            btn.className = `confirm-btn ${btnConfig.type || ''}`;
            btn.textContent = btnConfig.text || '确定';
            
            btn.onclick = () => {
                if (btnConfig.onClick) {
                    const result = btnConfig.onClick();
                    if (result !== false) {
                        this.closeDialog(overlay);
                    }
                } else {
                    resolve(index === config.buttons.length - 1); // 最后一个按钮默认为确定
                    this.closeDialog(overlay);
                }
            };
            
            footer.appendChild(btn);
        });
        
        return footer;
    }

    bindEvents(overlay, config, resolve) {
        // 遮罩点击关闭
        if (config.maskClosable) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    if (config.onClose) config.onClose();
                    this.closeDialog(overlay);
                }
            });
        }
        
        // ESC键关闭
        const handleKeydown = (e) => {
            if (e.key === 'Escape') {
                if (config.onClose) config.onClose();
                this.closeDialog(overlay);
                document.removeEventListener('keydown', handleKeydown);
            }
        };
        document.addEventListener('keydown', handleKeydown);
    }

    showDialog(dialog) {
        document.body.appendChild(dialog);
        document.body.style.overflow = 'hidden';
        
        requestAnimationFrame(() => {
            dialog.classList.add('show');
        });
    }

    closeDialog(dialog) {
        dialog.classList.remove('show');
        
        setTimeout(() => {
            if (dialog.parentNode) {
                dialog.parentNode.removeChild(dialog);
            }
            document.body.style.overflow = '';
        }, 300);
    }

    getTypeIcon(type) {
        const icons = {
            warning: '⚠️',
            error: '❌',
            info: 'ℹ️',
            success: '✅',
            question: '❓'
        };
        return icons[type] || icons.warning;
    }

    // 便捷方法
    warning(content, title = '警告') {
        return this.show({
            title,
            content,
            type: 'warning',
            buttons: [
                { text: '取消' },
                { text: '确定', type: 'warning' }
            ]
        });
    }

    error(content, title = '错误') {
        return this.show({
            title,
            content,
            type: 'error',
            buttons: [
                { text: '取消' },
                { text: '确定', type: 'danger' }
            ]
        });
    }

    info(content, title = '信息') {
        return this.show({
            title,
            content,
            type: 'info',
            buttons: [
                { text: '取消' },
                { text: '确定', type: 'primary' }
            ]
        });
    }

    success(content, title = '成功') {
        return this.show({
            title,
            content,
            type: 'success',
            buttons: [
                { text: '取消' },
                { text: '确定', type: 'success' }
            ]
        });
    }

    question(content, title = '确认') {
        return this.show({
            title,
            content,
            type: 'question',
            buttons: [
                { text: '否' },
                { text: '是', type: 'primary' }
            ]
        });
    }

    // 删除确认
    delete(content = '确定要删除吗？此操作不可撤销。', title = '删除确认') {
        return this.show({
            title,
            content,
            type: 'error',
            buttons: [
                { text: '取消' },
                { text: '删除', type: 'danger' }
            ]
        });
    }

    // 保存确认
    save(content = '确定要保存当前更改吗？', title = '保存确认') {
        return this.show({
            title,
            content,
            type: 'question',
            buttons: [
                { text: '取消' },
                { text: '保存', type: 'primary' }
            ]
        });
    }

    // 退出确认
    exit(content = '有未保存的更改，确定要退出吗？', title = '退出确认') {
        return this.show({
            title,
            content,
            type: 'warning',
            buttons: [
                { text: '取消' },
                { text: '不保存退出', type: 'warning' }
            ]
        });
    }
}

// 创建全局实例
const confirm = new ConfirmSystem();

// 全局方法
window.showConfirm = (options) => confirm.show(options);
window.confirm = {
    show: (options) => confirm.show(options),
    warning: (content, title) => confirm.warning(content, title),
    error: (content, title) => confirm.error(content, title),
    info: (content, title) => confirm.info(content, title),
    success: (content, title) => confirm.success(content, title),
    question: (content, title) => confirm.question(content, title),
    delete: (content, title) => confirm.delete(content, title),
    save: (content, title) => confirm.save(content, title),
    exit: (content, title) => confirm.exit(content, title)
};

console.log('Confirm系统已加载');