/**
 * 班级信息和系统设置缓存管理模块
 * 专门处理班级基本信息、系统设置等数据的缓存操作
 */

class ClassInfoCache {
    constructor() {
        this.cacheKeys = {
            CLASS_INFO: 'classInfo',
            SYSTEM_SETTINGS: 'classSystemSettings',
            CLASS_EMBLEM: 'classEmblem',
            DEFAULT_BADGE_CONFIG: 'defaultBadgeConfig'
        };
        
        this.data = {
            classInfo: {
                className: '',
                grade: '',
                totalStudents: 0,
                maleStudents: 0,
                femaleStudents: 0,
                classTeacher: '',
                classSlogan: '',
                emblem: ''
            },
            systemSettings: {
                theme: 'light',
                language: 'zh-CN',
                autoSave: true,
                notifications: true
            },
            classEmblem: '',
            defaultBadgeConfig: null
        };
        
        this.autoSave = true;
        this.lastModified = null;
        
        // 初始化时加载数据
        this.load();
    }
    
    /**
     * 从localStorage加载所有班级信息数据
     */
    load() {
        try {
            // 加载班级信息
            const classInfoData = localStorage.getItem(this.cacheKeys.CLASS_INFO);
            if (classInfoData) {
                this.data.classInfo = { ...this.data.classInfo, ...JSON.parse(classInfoData) };
            }
            
            // 加载系统设置
            const systemSettingsData = localStorage.getItem(this.cacheKeys.SYSTEM_SETTINGS);
            if (systemSettingsData) {
                this.data.systemSettings = { ...this.data.systemSettings, ...JSON.parse(systemSettingsData) };
            }
            
            // 加载班级徽章
            const emblemData = localStorage.getItem(this.cacheKeys.CLASS_EMBLEM);
            if (emblemData) {
                this.data.classEmblem = emblemData;
                this.data.classInfo.emblem = emblemData;
            }
            
            // 加载默认徽章配置
            const badgeConfigData = localStorage.getItem(this.cacheKeys.DEFAULT_BADGE_CONFIG);
            if (badgeConfigData) {
                this.data.defaultBadgeConfig = JSON.parse(badgeConfigData);
            }
            
            this.lastModified = Date.now();
            console.log('班级信息缓存加载完成');
            this.notifyChange('loaded', this.data);
        } catch (error) {
            console.error('加载班级信息失败:', error);
            this.setDefaults();
        }
    }
    
    /**
     * 设置默认值
     */
    setDefaults() {
        // 数据已在构造函数中设置默认值
        this.lastModified = Date.now();
    }
    
    /**
     * 保存数据到localStorage
     */
    save() {
        try {
            localStorage.setItem(this.cacheKeys.CLASS_INFO, JSON.stringify(this.data.classInfo));
            localStorage.setItem(this.cacheKeys.SYSTEM_SETTINGS, JSON.stringify(this.data.systemSettings));
            
            if (this.data.classEmblem) {
                localStorage.setItem(this.cacheKeys.CLASS_EMBLEM, this.data.classEmblem);
            }
            
            if (this.data.defaultBadgeConfig) {
                localStorage.setItem(this.cacheKeys.DEFAULT_BADGE_CONFIG, JSON.stringify(this.data.defaultBadgeConfig));
            }
            
            this.lastModified = Date.now();
            this.notifyChange('saved', this.data);
            console.log('班级信息已保存');
            return true;
        } catch (error) {
            console.error('保存班级信息失败:', error);
            return false;
        }
    }
    
    // ==================== 班级信息相关 ====================
    
    /**
     * 获取班级信息
     * @returns {Object} 班级信息对象
     */
    getClassInfo() {
        return { ...this.data.classInfo };
    }
    
    /**
     * 设置班级信息
     * @param {Object} classInfo - 班级信息对象
     * @returns {boolean} 是否设置成功
     */
    setClassInfo(classInfo) {
        if (typeof classInfo !== 'object' || classInfo === null) {
            console.warn('班级信息必须是对象');
            return false;
        }
        
        this.data.classInfo = { ...this.data.classInfo, ...classInfo };
        
        if (this.autoSave) {
            this.save();
        }
        
        this.notifyChange('classInfoChanged', this.data.classInfo);
        return true;
    }
    
    /**
     * 更新班级信息的特定字段
     * @param {string} field - 字段名
     * @param {*} value - 字段值
     * @returns {boolean} 是否更新成功
     */
    updateClassInfoField(field, value) {
        if (!field || typeof field !== 'string') {
            console.warn('字段名无效');
            return false;
        }
        
        this.data.classInfo[field] = value;
        
        if (this.autoSave) {
            this.save();
        }
        
        this.notifyChange('classInfoFieldChanged', { field, value });
        return true;
    }
    
    /**
     * 获取班级名称
     * @returns {string} 班级名称
     */
    getClassName() {
        return this.data.classInfo.className || '';
    }
    
    /**
     * 设置班级名称
     * @param {string} className - 班级名称
     * @returns {boolean} 是否设置成功
     */
    setClassName(className) {
        return this.updateClassInfoField('className', className);
    }
    
    /**
     * 获取学生总数
     * @returns {number} 学生总数
     */
    getTotalStudents() {
        return this.data.classInfo.totalStudents || 0;
    }
    
    /**
     * 设置学生总数
     * @param {number} total - 学生总数
     * @returns {boolean} 是否设置成功
     */
    setTotalStudents(total) {
        const num = parseInt(total);
        if (isNaN(num) || num < 0) {
            console.warn('学生总数必须是非负整数');
            return false;
        }
        return this.updateClassInfoField('totalStudents', num);
    }
    
    // ==================== 系统设置相关 ====================
    
    /**
     * 获取系统设置
     * @returns {Object} 系统设置对象
     */
    getSystemSettings() {
        return { ...this.data.systemSettings };
    }
    
    /**
     * 设置系统设置
     * @param {Object} settings - 系统设置对象
     * @returns {boolean} 是否设置成功
     */
    setSystemSettings(settings) {
        if (typeof settings !== 'object' || settings === null) {
            console.warn('系统设置必须是对象');
            return false;
        }
        
        this.data.systemSettings = { ...this.data.systemSettings, ...settings };
        
        if (this.autoSave) {
            this.save();
        }
        
        this.notifyChange('systemSettingsChanged', this.data.systemSettings);
        return true;
    }
    
    /**
     * 更新系统设置的特定字段
     * @param {string} field - 字段名
     * @param {*} value - 字段值
     * @returns {boolean} 是否更新成功
     */
    updateSystemSettingsField(field, value) {
        if (!field || typeof field !== 'string') {
            console.warn('字段名无效');
            return false;
        }
        
        this.data.systemSettings[field] = value;
        
        if (this.autoSave) {
            this.save();
        }
        
        this.notifyChange('systemSettingsFieldChanged', { field, value });
        return true;
    }
    
    /**
     * 获取主题设置
     * @returns {string} 主题名称
     */
    getTheme() {
        return this.data.systemSettings.theme || 'light';
    }
    
    /**
     * 设置主题
     * @param {string} theme - 主题名称
     * @returns {boolean} 是否设置成功
     */
    setTheme(theme) {
        if (!['light', 'dark'].includes(theme)) {
            console.warn('主题必须是 light 或 dark');
            return false;
        }
        return this.updateSystemSettingsField('theme', theme);
    }
    
    // ==================== 班级徽章相关 ====================
    
    /**
     * 获取班级徽章
     * @returns {string} 徽章数据
     */
    getClassEmblem() {
        return this.data.classEmblem || '';
    }
    
    /**
     * 设置班级徽章
     * @param {string} emblemData - 徽章数据（SVG或base64）
     * @returns {boolean} 是否设置成功
     */
    setClassEmblem(emblemData) {
        if (typeof emblemData !== 'string') {
            console.warn('徽章数据必须是字符串');
            return false;
        }
        
        this.data.classEmblem = emblemData;
        this.data.classInfo.emblem = emblemData;
        
        if (this.autoSave) {
            this.save();
        }
        
        this.notifyChange('classEmblemChanged', emblemData);
        return true;
    }
    
    /**
     * 清除班级徽章
     * @returns {boolean} 是否清除成功
     */
    clearClassEmblem() {
        this.data.classEmblem = '';
        this.data.classInfo.emblem = '';
        
        localStorage.removeItem(this.cacheKeys.CLASS_EMBLEM);
        localStorage.removeItem(this.cacheKeys.DEFAULT_BADGE_CONFIG);
        
        if (this.autoSave) {
            this.save();
        }
        
        this.notifyChange('classEmblemCleared', '');
        return true;
    }
    
    /**
     * 获取默认徽章配置
     * @returns {Object|null} 默认徽章配置
     */
    getDefaultBadgeConfig() {
        return this.data.defaultBadgeConfig ? { ...this.data.defaultBadgeConfig } : null;
    }
    
    /**
     * 设置默认徽章配置
     * @param {Object} config - 徽章配置
     * @returns {boolean} 是否设置成功
     */
    setDefaultBadgeConfig(config) {
        if (typeof config !== 'object' || config === null) {
            console.warn('徽章配置必须是对象');
            return false;
        }
        
        this.data.defaultBadgeConfig = { ...config };
        
        if (this.autoSave) {
            this.save();
        }
        
        this.notifyChange('defaultBadgeConfigChanged', this.data.defaultBadgeConfig);
        return true;
    }
    
    // ==================== 工具方法 ====================
    
    /**
     * 获取所有缓存信息
     * @returns {Object} 缓存信息
     */
    getCacheInfo() {
        return {
            lastModified: this.lastModified,
            autoSave: this.autoSave,
            data: {
                classInfo: this.data.classInfo,
                systemSettings: this.data.systemSettings,
                hasEmblem: !!this.data.classEmblem,
                hasBadgeConfig: !!this.data.defaultBadgeConfig
            }
        };
    }
    
    /**
     * 清空所有数据
     * @returns {boolean} 是否清空成功
     */
    clearAll() {
        try {
            Object.values(this.cacheKeys).forEach(key => {
                localStorage.removeItem(key);
            });
            
            this.setDefaults();
            
            this.notifyChange('allCleared', {});
            console.log('所有班级信息已清空');
            return true;
        } catch (error) {
            console.error('清空班级信息失败:', error);
            return false;
        }
    }
    
    /**
     * 导出所有数据
     * @param {string} format - 导出格式
     * @returns {string} 导出的数据
     */
    export(format = 'json') {
        const exportData = {
            ...this.data,
            exportTime: new Date().toISOString(),
            version: '1.0.0'
        };
        
        switch (format.toLowerCase()) {
            case 'json':
                return JSON.stringify(exportData, null, 2);
            default:
                console.warn('不支持的导出格式:', format);
                return this.export('json');
        }
    }
    
    /**
     * 导入数据
     * @param {string} data - 导入的数据
     * @param {string} format - 数据格式
     * @returns {boolean} 是否导入成功
     */
    import(data, format = 'json') {
        try {
            let importData;
            
            switch (format.toLowerCase()) {
                case 'json':
                    importData = JSON.parse(data);
                    break;
                default:
                    throw new Error('不支持的导入格式: ' + format);
            }
            
            // 验证和设置数据
            if (importData.classInfo) {
                this.setClassInfo(importData.classInfo);
            }
            
            if (importData.systemSettings) {
                this.setSystemSettings(importData.systemSettings);
            }
            
            if (importData.classEmblem) {
                this.setClassEmblem(importData.classEmblem);
            }
            
            if (importData.defaultBadgeConfig) {
                this.setDefaultBadgeConfig(importData.defaultBadgeConfig);
            }
            
            this.notifyChange('dataImported', importData);
            console.log('班级信息导入成功');
            return true;
        } catch (error) {
            console.error('导入班级信息失败:', error);
            return false;
        }
    }
    
    /**
     * 数据变更通知
     * @param {string} action - 操作类型
     * @param {*} data - 相关数据
     */
    notifyChange(action, data) {
        const event = new CustomEvent('classInfoCache:change', {
            detail: {
                action,
                data,
                timestamp: Date.now()
            }
        });
        window.dispatchEvent(event);
    }
    
    /**
     * 监听数据变更
     * @param {Function} callback - 回调函数
     */
    onChange(callback) {
        window.addEventListener('classInfoCache:change', callback);
    }
    
    /**
     * 移除数据变更监听
     * @param {Function} callback - 回调函数
     */
    offChange(callback) {
        window.removeEventListener('classInfoCache:change', callback);
    }
}

// 创建全局实例
const classInfoCache = new ClassInfoCache();

// 兼容旧代码的全局函数
function getClassInfo() {
    return classInfoCache.getClassInfo();
}

function setClassInfo(info) {
    return classInfoCache.setClassInfo(info);
}

function getSystemSettings() {
    return classInfoCache.getSystemSettings();
}

function setSystemSettings(settings) {
    return classInfoCache.setSystemSettings(settings);
}

// 全局暴露
if (typeof window !== 'undefined') {
    window.ClassInfoCache = ClassInfoCache;
    window.classInfoCache = classInfoCache;
}

console.log('班级信息缓存模块已加载');

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ClassInfoCache, classInfoCache };
}