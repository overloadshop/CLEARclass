/**
 * 简洁高效的模态框系统
 * 支持自定义内容、大小、位置和回调
 */

class ModalSystem {
    constructor() {
        this.modals = [];
        this.zIndexBase = 1000;
        this.init();
    }

    init() {
        // 添加基础样式
        this.addBaseStyles();
        
        // 绑定全局事件
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeTop();
            }
        });
    }

    addBaseStyles() {
        if (document.getElementById('modal-base-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'modal-base-styles';
        style.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
                backdrop-filter: blur(2px);
            }
            
            .modal-overlay.show {
                opacity: 1;
            }
            
            .modal-container {
                background: white;
                border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                max-width: 90vw;
                max-height: 90vh;
                overflow: hidden;
                transform: scale(0.9) translateY(-20px);
                transition: transform 0.3s ease;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .modal-overlay.show .modal-container {
                transform: scale(1) translateY(0);
            }
            
            .modal-header {
                padding: 20px 24px 16px;
                border-bottom: 1px solid #f0f0f0;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .modal-title {
                font-size: 16px;
                font-weight: 600;
                color: #333;
                margin: 0;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 20px;
                color: #999;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: all 0.2s;
                line-height: 1;
            }
            
            .modal-close:hover {
                background: #f5f5f5;
                color: #666;
            }
            
            .modal-body {
                padding: 20px 24px;
                overflow-y: auto;
                max-height: calc(90vh - 140px);
            }
            
            .modal-footer {
                padding: 16px 24px 20px;
                border-top: 1px solid #f0f0f0;
                display: flex;
                justify-content: flex-end;
                gap: 8px;
            }
            
            .modal-btn {
                padding: 8px 16px;
                border: 1px solid #d9d9d9;
                border-radius: 4px;
                background: white;
                color: #333;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
                min-width: 70px;
            }
            
            .modal-btn:hover {
                border-color: #40a9ff;
                color: #40a9ff;
            }
            
            .modal-btn.primary {
                background: #1890ff;
                border-color: #1890ff;
                color: white;
            }
            
            .modal-btn.primary:hover {
                background: #40a9ff;
                border-color: #40a9ff;
            }
            
            .modal-btn.danger {
                background: #ff4d4f;
                border-color: #ff4d4f;
                color: white;
            }
            
            .modal-btn.danger:hover {
                background: #ff7875;
                border-color: #ff7875;
            }
            
            @media (max-width: 768px) {
                .modal-container {
                    margin: 20px;
                    max-width: calc(100vw - 40px);
                }
                
                .modal-header, .modal-body, .modal-footer {
                    padding-left: 16px;
                    padding-right: 16px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 显示模态框
     * @param {Object} options - 配置选项
     * @param {string} options.title - 标题
     * @param {string|HTMLElement} options.content - 内容
     * @param {Array} options.buttons - 按钮配置
     * @param {string} options.size - 大小: small, medium, large, auto
     * @param {boolean} options.closable - 是否可关闭
     * @param {boolean} options.maskClosable - 点击遮罩是否关闭
     * @param {Function} options.onClose - 关闭回调
     * @param {string} options.className - 自定义类名
     */
    show(options = {}) {
        const config = {
            title: '提示',
            content: '',
            buttons: [],
            size: 'medium',
            closable: true,
            maskClosable: true,
            onClose: null,
            className: '',
            ...options
        };

        const modal = this.createModal(config);
        this.addModal(modal, config);
        
        return modal;
    }

    createModal(config) {
        const overlay = document.createElement('div');
        overlay.className = `modal-overlay ${config.className}`;
        overlay.style.zIndex = this.zIndexBase + this.modals.length;
        
        const container = document.createElement('div');
        container.className = 'modal-container';
        
        // 设置大小
        this.applySize(container, config.size);
        
        // 创建头部
        const header = this.createHeader(config);
        if (header) container.appendChild(header);
        
        // 创建内容
        const body = this.createBody(config);
        container.appendChild(body);
        
        // 创建底部
        const footer = this.createFooter(config, overlay);
        if (footer) container.appendChild(footer);
        
        overlay.appendChild(container);
        
        // 绑定事件
        this.bindModalEvents(overlay, config);
        
        return overlay;
    }

    applySize(container, size) {
        const sizes = {
            small: { width: '400px' },
            medium: { width: '520px' },
            large: { width: '800px' },
            auto: { width: 'auto', minWidth: '300px' }
        };
        
        const sizeConfig = sizes[size] || sizes.medium;
        Object.assign(container.style, sizeConfig);
    }

    createHeader(config) {
        if (!config.title && !config.closable) return null;
        
        const header = document.createElement('div');
        header.className = 'modal-header';
        
        if (config.title) {
            const title = document.createElement('h3');
            title.className = 'modal-title';
            title.textContent = config.title;
            header.appendChild(title);
        }
        
        if (config.closable) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'modal-close';
            closeBtn.innerHTML = '×';
            closeBtn.onclick = () => this.close(header.closest('.modal-overlay'));
            header.appendChild(closeBtn);
        }
        
        return header;
    }

    createBody(config) {
        const body = document.createElement('div');
        body.className = 'modal-body';
        
        if (typeof config.content === 'string') {
            body.innerHTML = config.content;
        } else if (config.content instanceof HTMLElement) {
            body.appendChild(config.content);
        }
        
        return body;
    }

    createFooter(config, overlay) {
        if (!config.buttons || config.buttons.length === 0) return null;
        
        const footer = document.createElement('div');
        footer.className = 'modal-footer';
        
        config.buttons.forEach(btnConfig => {
            const btn = document.createElement('button');
            btn.className = `modal-btn ${btnConfig.type || ''}`;
            btn.textContent = btnConfig.text || '确定';
            
            btn.onclick = () => {
                if (btnConfig.onClick) {
                    const result = btnConfig.onClick(overlay);
                    if (result !== false) {
                        this.close(overlay);
                    }
                } else {
                    this.close(overlay);
                }
            };
            
            footer.appendChild(btn);
        });
        
        return footer;
    }

    bindModalEvents(overlay, config) {
        // 遮罩点击关闭
        if (config.maskClosable) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.close(overlay);
                }
            });
        }
    }

    addModal(modal, config) {
        document.body.appendChild(modal);
        this.modals.push({ element: modal, config });
        
        // 触发显示动画
        requestAnimationFrame(() => {
            modal.classList.add('show');
        });
        
        // 禁用页面滚动
        if (this.modals.length === 1) {
            document.body.style.overflow = 'hidden';
        }
    }

    close(modal) {
        const index = this.modals.findIndex(m => m.element === modal);
        if (index === -1) return;
        
        const modalData = this.modals[index];
        
        // 触发关闭动画
        modal.classList.remove('show');
        
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
            
            this.modals.splice(index, 1);
            
            // 恢复页面滚动
            if (this.modals.length === 0) {
                document.body.style.overflow = '';
            }
            
            // 执行关闭回调
            if (modalData.config.onClose) {
                modalData.config.onClose();
            }
        }, 300);
    }

    closeTop() {
        if (this.modals.length > 0) {
            const topModal = this.modals[this.modals.length - 1];
            if (topModal.config.closable !== false) {
                this.close(topModal.element);
            }
        }
    }

    closeAll() {
        [...this.modals].forEach(modalData => {
            this.close(modalData.element);
        });
    }

    // 便捷方法
    alert(message, title = '提示') {
        return this.show({
            title,
            content: message,
            buttons: [{ text: '确定', type: 'primary' }]
        });
    }

    confirm(message, title = '确认') {
        return new Promise((resolve) => {
            this.show({
                title,
                content: message,
                buttons: [
                    { text: '取消', onClick: () => resolve(false) },
                    { text: '确定', type: 'primary', onClick: () => resolve(true) }
                ]
            });
        });
    }

    prompt(message, defaultValue = '', title = '输入') {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'text';
            input.value = defaultValue;
            input.style.cssText = `
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #d9d9d9;
                border-radius: 4px;
                font-size: 14px;
                margin-top: 12px;
            `;
            
            const content = document.createElement('div');
            content.innerHTML = message;
            content.appendChild(input);
            
            this.show({
                title,
                content,
                buttons: [
                    { text: '取消', onClick: () => resolve(null) },
                    { text: '确定', type: 'primary', onClick: () => resolve(input.value) }
                ],
                onClose: () => resolve(null)
            });
            
            setTimeout(() => input.focus(), 100);
        });
    }
}

// 创建全局实例
const modal = new ModalSystem();

// 全局方法
window.showModal = (options) => modal.show(options);
window.modal = {
    show: (options) => modal.show(options),
    alert: (message, title) => modal.alert(message, title),
    confirm: (message, title) => modal.confirm(message, title),
    prompt: (message, defaultValue, title) => modal.prompt(message, defaultValue, title),
    close: (modalElement) => modal.close(modalElement),
    closeAll: () => modal.closeAll()
};

// 兼容原有调用方式
window.showConfirmModal = (message, callback, title = '确认') => {
    modal.confirm(message, title).then(callback);
};

window.showPromptModal = (message, callback, defaultValue = '', title = '输入') => {
    modal.prompt(message, defaultValue, title).then(callback);
};

console.log('Modal系统已加载');