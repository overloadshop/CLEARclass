/**
 * 班级管理系统安全验证模块
 * 提供密码验证、敏感操作保护等功能
 */

class SecuritySystem {
    constructor() {
        this.SECURITY_KEY = 'securitySettings';
        this.PASSWORD_FILE_KEY = 'securityPasswordHash';
    }

    // 专属哈希算法（单向）
    customHash(password) {
        let hash = 0;
        const salt = 'ClassManagementSystem2025';
        const input = password + salt;
        
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        
        // 进行多轮变换
        for (let round = 0; round < 3; round++) {
            hash = Math.abs(hash);
            hash = hash * 1103515245 + 12345;
            hash = hash & 0x7fffffff;
        }
        
        return hash.toString(16);
    }

    // 检查是否已设置密码
    hasPassword() {
        return localStorage.getItem(this.PASSWORD_FILE_KEY) !== null;
    }

    // 验证密码
    verifyPassword(inputPassword) {
        const storedHash = localStorage.getItem(this.PASSWORD_FILE_KEY);
        if (!storedHash) return false;
        return this.customHash(inputPassword) === storedHash;
    }

    // 设置密码
    setPassword(password) {
        const hash = this.customHash(password);
        localStorage.setItem(this.PASSWORD_FILE_KEY, hash);
    }

    // 获取安全设置
    getSecuritySettings() {
        const settings = localStorage.getItem(this.SECURITY_KEY);
        return settings ? JSON.parse(settings) : { enabled: false };
    }

    // 保存安全设置
    saveSecuritySettings(settings) {
        localStorage.setItem(this.SECURITY_KEY, JSON.stringify(settings));
    }

    // 检查是否启用了安全验证
    isSecurityEnabled() {
        const settings = this.getSecuritySettings();
        return settings.enabled && this.hasPassword();
    }

    // 执行敏感操作前的验证
    async verifySensitiveOperation(operationName) {
        if (!this.isSecurityEnabled()) {
            return true; // 未启用安全验证，直接通过
        }

        return new Promise((resolve) => {
            this.showPasswordVerificationDialog(operationName, (success) => {
                resolve(success);
            });
        });
    }

    // 显示密码验证对话框
    showPasswordVerificationDialog(title, callback) {
        const dialog = document.createElement('div');
        dialog.className = 'security-dialog-overlay';
        dialog.innerHTML = `
            <div class="security-dialog">
                <div class="security-dialog-header">
                    <h3>${title}</h3>
                    <p>此操作需要密码验证</p>
                </div>
                <div class="security-dialog-content">
                    <div class="input-group">
                        <label>密码</label>
                        <input type="password" id="verifyPassword" placeholder="请输入密码" maxlength="20">
                    </div>
                </div>
                <div class="security-dialog-actions">
                    <button class="btn btn-secondary" onclick="securitySystem.closeSecurityDialog(); (${callback})(false);">取消</button>
                    <button class="btn btn-primary" onclick="securitySystem.confirmPasswordVerification(${callback})">确定</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        document.getElementById('verifyPassword').focus();
        
        // 添加回车键支持
        document.getElementById('verifyPassword').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.confirmPasswordVerification(callback);
            }
        });
    }

    // 确认密码验证
    confirmPasswordVerification(callback) {
        const password = document.getElementById('verifyPassword').value;
        
        if (!password) {
            if (typeof showToast !== 'undefined') {
                showToast('请输入密码', 'error');
            } else {
                alert('请输入密码');
            }
            return;
        }
        
        if (this.verifyPassword(password)) {
            this.closeSecurityDialog();
            callback(true);
        } else {
            if (typeof showToast !== 'undefined') {
                showToast('密码错误', 'error');
            } else {
                alert('密码错误');
            }
        }
    }

    // 关闭安全对话框
    closeSecurityDialog() {
        const dialog = document.querySelector('.security-dialog-overlay');
        if (dialog) {
            dialog.remove();
        }
    }

    // 添加安全对话框样式（如果页面未包含）
    addSecurityStyles() {
        if (document.querySelector('#security-styles')) {
            return; // 样式已存在
        }

        const style = document.createElement('style');
        style.id = 'security-styles';
        style.textContent = `
            .security-dialog-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            }
            
            .security-dialog {
                background: white;
                border-radius: 12px;
                width: 90%;
                max-width: 400px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.15);
                animation: slideUp 0.3s ease;
            }
            
            .security-dialog-header {
                padding: 24px 24px 16px;
                border-bottom: 1px solid #e9ecef;
            }
            
            .security-dialog-header h3 {
                margin: 0 0 8px;
                color: #333;
                font-size: 18px;
                font-weight: 600;
            }
            
            .security-dialog-header p {
                margin: 0;
                color: #666;
                font-size: 14px;
            }
            
            .security-dialog-content {
                padding: 20px 24px;
            }
            
            .input-group {
                margin-bottom: 16px;
            }
            
            .input-group label {
                display: block;
                margin-bottom: 6px;
                color: #333;
                font-size: 14px;
                font-weight: 500;
            }
            
            .input-group input {
                width: 100%;
                padding: 10px 12px;
                border: 1px solid #e9ecef;
                border-radius: 6px;
                font-size: 14px;
                transition: border-color 0.3s ease;
                box-sizing: border-box;
            }
            
            .input-group input:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
            
            .security-dialog-actions {
                padding: 16px 24px 24px;
                display: flex;
                gap: 12px;
                justify-content: flex-end;
            }
            
            .security-dialog-actions .btn {
                min-width: 80px;
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .btn-secondary {
                background: #6c757d;
                color: white;
            }
            
            .btn-primary {
                background: #667eea;
                color: white;
            }
            
            .btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    // 初始化安全系统
    init() {
        this.addSecurityStyles();
    }
}

// 创建全局安全系统实例
const securitySystem = new SecuritySystem();

// 页面加载时初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        securitySystem.init();
    });
} else {
    securitySystem.init();
}

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecuritySystem;
}