/**
 * Toast吐司提示系统 - 完全兼容原始demo.html样式
 */
class ToastSystem {
    constructor() {
        this.containers = {};
        this.toasts = [];
        this.defaultPosition = 'top-right';
        this.init();
    }

    init() {
        // 添加样式
        this.addStyles();
        // 创建默认容器
        this.getContainer(this.defaultPosition);
    }
    
    getContainer(position = 'top-right') {
        if (!this.containers[position]) {
            const container = document.createElement('div');
            container.className = `toast-container toast-${position}`;
            container.id = `toastContainer-${position}`;
            document.body.appendChild(container);
            this.containers[position] = container;
        }
        return this.containers[position];
    }
    
    addStyles() {
        if (document.getElementById('toast-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .toast-container {
                position: fixed;
                z-index: 9999;
                pointer-events: none;
            }
            
            .toast-top-right {
                top: 20px;
                right: 20px;
            }
            
            .toast-top-left {
                top: 20px;
                left: 20px;
            }
            
            .toast-bottom-right {
                bottom: 20px;
                right: 20px;
            }
            
            .toast-bottom-left {
                bottom: 20px;
                left: 20px;
            }
            
            .toast-top-center {
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
            }
            
            .toast-bottom-center {
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
            }
            
            .toast {
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                padding: 16px 20px;
                margin-bottom: 10px;
                min-width: 200px;
                max-width: 400px;
                width: auto;
                border-left: 4px solid #007bff;
                display: flex;
                align-items: center;
                gap: 12px;
                transition: all 0.3s ease, margin-bottom 0.3s ease, opacity 0.3s ease;
                pointer-events: auto;
                opacity: 1;
            }
            
            /* 默认右侧位置的初始状态 */
            .toast-top-right .toast,
            .toast-bottom-right .toast {
                transform: translateX(100%);
            }
            
            /* 左侧位置的初始状态 */
            .toast-top-left .toast,
            .toast-bottom-left .toast {
                transform: translateX(-100%);
            }
            
            /* 顶部居中的初始状态 */
            .toast-top-center .toast {
                transform: translateY(-100%);
            }
            
            /* 底部居中的初始状态 */
            .toast-bottom-center .toast {
                transform: translateY(100%);
            }
            
            /* 所有位置的显示状态 */
            .toast.show {
                transform: translateX(0) translateY(0);
            }
            
            .toast.success {
                border-left-color: #28a745;
            }
            
            .toast.error {
                border-left-color: #dc3545;
            }
            
            .toast.warning {
                border-left-color: #ffc107;
            }
            
            .toast.info {
                border-left-color: #17a2b8;
            }
            
            .toast-icon {
                width: 20px;
                height: 20px;
                flex-shrink: 0;
            }
            
            .toast-icon.success {
                color: #28a745;
            }
            
            .toast-icon.error {
                color: #dc3545;
            }
            
            .toast-icon.warning {
                color: #ffc107;
            }
            
            .toast-icon.info {
                color: #17a2b8;
            }
            
            .toast-content {
                flex: 1;
            }
            
            .toast-title {
                font-weight: 600;
                margin-bottom: 4px;
                color: #333;
            }
            
            .toast-message {
                color: #666;
                font-size: 14px;
                line-height: 1.4;
            }
            
            .toast-close {
                background: none;
                border: none;
                color: #999;
                cursor: pointer;
                font-size: 18px;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }
            
            .toast-close:hover {
                color: #666;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 显示Toast提示 - 兼容原始demo.html接口
     * @param {string|Object} message 消息内容或配置对象
     * @param {string} type 类型: success, error, warning, info
     * @param {string} title 标题
     * @param {number} duration 显示时长(ms)
     * @param {string} position 位置: top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
     */
    show(message, type = 'info', title = '', duration = 3000, position = 'top-right') {
        // 支持对象参数（新接口）
        if (typeof message === 'object') {
            const config = message;
            return this.showAdvanced(config);
        }
        
        // 获取对应位置的容器
        const container = this.getContainer(position);
        
        // 创建Toast元素
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        // 图标映射
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        
        // 标题映射
        const titles = {
            success: title || '成功',
            error: title || '错误',
            warning: title || '警告',
            info: title || '提示'
        };
        
        toast.innerHTML = `
            <div class="toast-icon ${type}">${icons[type] || 'ℹ'}</div>
            <div class="toast-content">
                <div class="toast-title">${titles[type]}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="closeToast(this)">×</button>
        `;
        
        // 添加到容器
        container.appendChild(toast);
        this.toasts.push(toast);
        
        // 触发显示动画
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // 自动关闭
        if (duration > 0) {
            setTimeout(() => {
                this.closeToast(toast);
            }, duration);
        }
        
        return toast;
    }
    
    /**
     * 高级Toast显示（支持更多配置）
     */
    showAdvanced(config = {}) {
        const defaultConfig = {
            message: '',
            type: 'info',
            title: '',
            duration: 3000,
            position: 'top-right',
            closable: true,
            onClick: null,
            onClose: null
        };
        
        config = { ...defaultConfig, ...config };
        
        const toast = this.createAdvancedToast(config);
        this.addAdvancedToast(toast, config);
        
        return toast;
    }

    createAdvancedToast(config) {
        const toast = document.createElement('div');
        toast.className = `toast ${config.type}`;
        
        // 图标映射
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        
        const icon = config.icon || icons[config.type] || 'ℹ';
        const title = config.title || this.getDefaultTitle(config.type);
        
        toast.innerHTML = `
            <div class="toast-icon ${config.type}">${icon}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${config.message}</div>
            </div>
            ${config.closable ? '<button class="toast-close">×</button>' : ''}
        `;
        
        // 绑定事件
        this.bindAdvancedToastEvents(toast, config);
        
        return toast;
    }
    
    getDefaultTitle(type) {
        const titles = {
            success: '成功',
            error: '错误',
            warning: '警告',
            info: '提示'
        };
        return titles[type] || '提示';
    }

    closeToast(toast) {
        if (toast && toast.parentNode) {
            // 获取容器位置，决定滑出方向
            const container = toast.parentNode;
            const containerClass = container.className;
            
            // 第一阶段：淡出和滑动
            toast.style.opacity = '0';
            
            if (containerClass.includes('top-left') || containerClass.includes('bottom-left')) {
                toast.style.transform = 'translateX(-100%)';
            } else if (containerClass.includes('top-center')) {
                toast.style.transform = 'translateY(-100%)';
            } else if (containerClass.includes('bottom-center')) {
                toast.style.transform = 'translateY(100%)';
            } else {
                toast.style.transform = 'translateX(100%)';
            }
            
            setTimeout(() => {
                // 第二阶段：收缩高度和margin
                toast.style.marginBottom = '0';
                toast.style.maxHeight = '0';
                toast.style.padding = '0 20px';
                toast.style.overflow = 'hidden';
                
                setTimeout(() => {
                    // 第三阶段：移除DOM元素
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                    const index = this.toasts.indexOf(toast);
                    if (index > -1) {
                        this.toasts.splice(index, 1);
                    }
                }, 300);
            }, 200);
        }
    }

    bindAdvancedToastEvents(toast, config) {
        // 点击事件
        if (config.onClick) {
            toast.style.cursor = 'pointer';
            toast.addEventListener('click', (e) => {
                if (!e.target.classList.contains('toast-close')) {
                    config.onClick(toast);
                }
            });
        }
        
        // 关闭按钮事件
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeToast(toast);
                if (config.onClose) {
                    config.onClose(toast);
                }
            });
        }
    }

    addAdvancedToast(toast, config) {
        const container = this.getContainer(config.position);
        container.appendChild(toast);
        this.toasts.push(toast);
        
        // 触发显示动画
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // 自动关闭
        if (config.duration > 0) {
            setTimeout(() => {
                this.closeToast(toast);
            }, config.duration);
        }
    }

    // 便捷方法 - 兼容原始接口
    success(message, title = '', duration = 3000, position = 'top-right') {
        return this.show(message, 'success', title, duration, position);
    }
    
    error(message, title = '', duration = 3000, position = 'top-right') {
        return this.show(message, 'error', title, duration, position);
    }
    
    warning(message, title = '', duration = 3000, position = 'top-right') {
        return this.show(message, 'warning', title, duration, position);
    }
    
    info(message, title = '', duration = 3000, position = 'top-right') {
        return this.show(message, 'info', title, duration, position);
    }

    // 清除所有Toast
    clear() {
        this.toasts.forEach(toast => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        });
        this.toasts = [];
    }
}

// 创建全局实例
const toastInstance = new ToastSystem();

// 全局closeToast函数（兼容原始HTML中的onclick调用）
window.closeToast = function(closeBtn) {
    const toast = closeBtn.closest('.toast');
    if (toast) {
        toastInstance.closeToast(toast);
    }
};

// 全局showToast函数（完全兼容原始demo.html接口）
window.showToast = function(message, type = 'info', title = '', duration = 3000) {
    return toastInstance.show(message, type, title, duration);
};

// 现代化toast对象
window.toast = {
    show: (message, type, title, duration) => toastInstance.show(message, type, title, duration),
    success: (message, title, duration) => toastInstance.success(message, title, duration),
    error: (message, title, duration) => toastInstance.error(message, title, duration),
    warning: (message, title, duration) => toastInstance.warning(message, title, duration),
    info: (message, title, duration) => toastInstance.info(message, title, duration),
    clear: () => toastInstance.clear()
};

// 兼容showMessage方法
window.showMessage = function(message, type = 'info') {
    return toastInstance.show(message, type);
};

console.log('Toast系统已加载 - 完全兼容原始demo.html样式和接口');