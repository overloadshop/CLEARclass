/**
 * 作业数据缓存管理模块
 * 专门处理作业信息、任务列表等数据的缓存操作
 */

class HomeworkCache {
    constructor() {
        this.cacheKeys = {
            HOMEWORK_DATA: 'homeworkData'
        };
        
        this.data = {
            homeworkData: []
        };
        
        this.autoSave = true;
        this.lastModified = null;
        
        // 初始化时加载数据
        this.load();
    }
    
    /**
     * 从localStorage加载作业数据
     */
    load() {
        try {
            const homeworkData = localStorage.getItem(this.cacheKeys.HOMEWORK_DATA);
            if (homeworkData) {
                const loadedData = JSON.parse(homeworkData);
                this.data.homeworkData = this.validateAndNormalizeData(loadedData);
            }
            
            this.lastModified = Date.now();
            console.log('作业数据缓存加载完成');
            this.notifyChange('loaded', this.data.homeworkData);
        } catch (error) {
            console.error('加载作业数据失败:', error);
            this.data.homeworkData = [];
        }
    }
    
    /**
     * 验证和标准化作业数据
     * @param {Array} data - 原始数据
     * @returns {Array} 标准化后的数据
     */
    validateAndNormalizeData(data) {
        if (!Array.isArray(data)) {
            return [];
        }
        
        return data.map(hw => {
            if (typeof hw !== 'object' || hw === null) {
                return null;
            }
            
            // 标准化任务数据
            const tasks = (hw.tasks || (hw.content ? [hw.content] : [])).map(task => {
                if (typeof task === 'string') {
                    return { 
                        content: task, 
                        settings: { 
                            isClassroomHomework: false, 
                            noHandIn: false 
                        } 
                    };
                }
                
                // 确保旧的对象结构也包含 settings
                if (!task.settings) {
                    task.settings = { 
                        isClassroomHomework: false, 
                        noHandIn: false 
                    };
                }
                
                return task;
            });
            
            return {
                id: hw.id || this.generateId(),
                subject: hw.subject || '',
                deadline: hw.deadline || '',
                tasks: tasks,
                createdAt: hw.createdAt || new Date().toISOString(),
                updatedAt: hw.updatedAt || new Date().toISOString(),
                status: hw.status || 'pending', // pending, completed, overdue
                priority: hw.priority || 'normal', // low, normal, high
                tags: hw.tags || [],
                notes: hw.notes || ''
            };
        }).filter(hw => hw !== null);
    }
    
    /**
     * 生成唯一ID
     * @returns {string} 唯一ID
     */
    generateId() {
        return 'hw_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * 保存数据到localStorage
     */
    save() {
        try {
            localStorage.setItem(this.cacheKeys.HOMEWORK_DATA, JSON.stringify(this.data.homeworkData));
            
            this.lastModified = Date.now();
            this.notifyChange('saved', this.data.homeworkData);
            console.log('作业数据已保存');
            return true;
        } catch (error) {
            console.error('保存作业数据失败:', error);
            return false;
        }
    }
    
    // ==================== 作业管理相关 ====================
    
    /**
     * 获取所有作业
     * @returns {Array} 作业列表
     */
    getAllHomework() {
        return [...this.data.homeworkData];
    }
    
    /**
     * 根据ID获取作业
     * @param {string} id - 作业ID
     * @returns {Object|null} 作业对象
     */
    getHomeworkById(id) {
        return this.data.homeworkData.find(hw => hw.id === id) || null;
    }
    
    /**
     * 添加作业
     * @param {Object} homework - 作业对象
     * @returns {boolean} 是否添加成功
     */
    addHomework(homework) {
        if (!homework || typeof homework !== 'object') {
            console.warn('作业数据无效');
            return false;
        }
        
        const newHomework = {
            id: homework.id || this.generateId(),
            subject: homework.subject || '',
            deadline: homework.deadline || '',
            tasks: homework.tasks || [],
            createdAt: homework.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: homework.status || 'pending',
            priority: homework.priority || 'normal',
            tags: homework.tags || [],
            notes: homework.notes || ''
        };
        
        this.data.homeworkData.push(newHomework);
        
        if (this.autoSave) {
            this.save();
        }
        
        this.notifyChange('homeworkAdded', newHomework);
        return true;
    }
    
    /**
     * 更新作业
     * @param {string} id - 作业ID
     * @param {Object} updates - 更新数据
     * @returns {boolean} 是否更新成功
     */
    updateHomework(id, updates) {
        const index = this.data.homeworkData.findIndex(hw => hw.id === id);
        if (index === -1) {
            console.warn('作业不存在:', id);
            return false;
        }
        
        this.data.homeworkData[index] = {
            ...this.data.homeworkData[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        if (this.autoSave) {
            this.save();
        }
        
        this.notifyChange('homeworkUpdated', { id, updates });
        return true;
    }
    
    /**
     * 删除作业
     * @param {string} id - 作业ID
     * @returns {boolean} 是否删除成功
     */
    removeHomework(id) {
        const index = this.data.homeworkData.findIndex(hw => hw.id === id);
        if (index === -1) {
            console.warn('作业不存在:', id);
            return false;
        }
        
        const removedHomework = this.data.homeworkData.splice(index, 1)[0];
        
        if (this.autoSave) {
            this.save();
        }
        
        this.notifyChange('homeworkRemoved', removedHomework);
        return true;
    }
    
    /**
     * 清空所有作业
     * @returns {boolean} 是否清空成功
     */
    clearAllHomework() {
        this.data.homeworkData = [];
        
        if (this.autoSave) {
            this.save();
        }
        
        this.notifyChange('allHomeworkCleared', []);
        return true;
    }
    
    // ==================== 搜索和筛选 ====================
    
    /**
     * 搜索作业
     * @param {string} keyword - 搜索关键词
     * @returns {Array} 匹配的作业列表
     */
    searchHomework(keyword) {
        if (!keyword) {
            return this.getAllHomework();
        }
        
        const lowerKeyword = keyword.toLowerCase();
        
        return this.data.homeworkData.filter(hw => {
            return hw.subject.toLowerCase().includes(lowerKeyword) ||
                   hw.notes.toLowerCase().includes(lowerKeyword) ||
                   hw.tasks.some(task => 
                       task.content.toLowerCase().includes(lowerKeyword)
                   ) ||
                   hw.tags.some(tag => 
                       tag.toLowerCase().includes(lowerKeyword)
                   );
        });
    }
    
    /**
     * 按状态筛选作业
     * @param {string} status - 状态
     * @returns {Array} 筛选后的作业列表
     */
    getHomeworkByStatus(status) {
        return this.data.homeworkData.filter(hw => hw.status === status);
    }
    
    /**
     * 按优先级筛选作业
     * @param {string} priority - 优先级
     * @returns {Array} 筛选后的作业列表
     */
    getHomeworkByPriority(priority) {
        return this.data.homeworkData.filter(hw => hw.priority === priority);
    }
    
    /**
     * 按科目筛选作业
     * @param {string} subject - 科目
     * @returns {Array} 筛选后的作业列表
     */
    getHomeworkBySubject(subject) {
        return this.data.homeworkData.filter(hw => hw.subject === subject);
    }
    
    /**
     * 获取即将到期的作业
     * @param {number} days - 天数
     * @returns {Array} 即将到期的作业列表
     */
    getUpcomingHomework(days = 3) {
        const now = new Date();
        const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        
        return this.data.homeworkData.filter(hw => {
            if (!hw.deadline) return false;
            
            const deadline = new Date(hw.deadline);
            return deadline >= now && deadline <= futureDate;
        }).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    }
    
    /**
     * 获取过期作业
     * @returns {Array} 过期作业列表
     */
    getOverdueHomework() {
        const now = new Date();
        
        return this.data.homeworkData.filter(hw => {
            if (!hw.deadline) return false;
            
            const deadline = new Date(hw.deadline);
            return deadline < now && hw.status !== 'completed';
        }).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    }
    
    // ==================== 统计功能 ====================
    
    /**
     * 获取作业统计信息
     * @returns {Object} 统计信息
     */
    getStatistics() {
        const total = this.data.homeworkData.length;
        const completed = this.getHomeworkByStatus('completed').length;
        const pending = this.getHomeworkByStatus('pending').length;
        const overdue = this.getOverdueHomework().length;
        const upcoming = this.getUpcomingHomework().length;
        
        // 按科目统计
        const subjectStats = {};
        this.data.homeworkData.forEach(hw => {
            if (hw.subject) {
                subjectStats[hw.subject] = (subjectStats[hw.subject] || 0) + 1;
            }
        });
        
        // 按优先级统计
        const priorityStats = {
            high: this.getHomeworkByPriority('high').length,
            normal: this.getHomeworkByPriority('normal').length,
            low: this.getHomeworkByPriority('low').length
        };
        
        return {
            total,
            completed,
            pending,
            overdue,
            upcoming,
            completionRate: total > 0 ? (completed / total * 100).toFixed(1) : 0,
            subjectStats,
            priorityStats
        };
    }
    
    /**
     * 获取所有科目列表
     * @returns {Array} 科目列表
     */
    getAllSubjects() {
        const subjects = new Set();
        this.data.homeworkData.forEach(hw => {
            if (hw.subject) {
                subjects.add(hw.subject);
            }
        });
        return Array.from(subjects).sort();
    }
    
    /**
     * 获取所有标签列表
     * @returns {Array} 标签列表
     */
    getAllTags() {
        const tags = new Set();
        this.data.homeworkData.forEach(hw => {
            hw.tags.forEach(tag => tags.add(tag));
        });
        return Array.from(tags).sort();
    }
    
    // ==================== 工具方法 ====================
    
    /**
     * 获取所有缓存信息
     * @returns {Object} 缓存信息
     */
    getCacheInfo() {
        const stats = this.getStatistics();
        
        return {
            lastModified: this.lastModified,
            autoSave: this.autoSave,
            data: {
                homeworkCount: this.data.homeworkData.length,
                ...stats
            }
        };
    }
    
    /**
     * 清空所有数据
     * @returns {boolean} 是否清空成功
     */
    clearAll() {
        try {
            localStorage.removeItem(this.cacheKeys.HOMEWORK_DATA);
            this.data.homeworkData = [];
            
            this.notifyChange('allCleared', []);
            console.log('所有作业数据已清空');
            return true;
        } catch (error) {
            console.error('清空作业数据失败:', error);
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
            homeworkData: this.data.homeworkData,
            statistics: this.getStatistics(),
            exportTime: new Date().toISOString(),
            version: '1.0.0'
        };
        
        switch (format.toLowerCase()) {
            case 'json':
                return JSON.stringify(exportData, null, 2);
            case 'csv':
                return this.exportToCSV();
            default:
                console.warn('不支持的导出格式:', format);
                return this.export('json');
        }
    }
    
    /**
     * 导出为CSV格式
     * @returns {string} CSV数据
     */
    exportToCSV() {
        let csv = '科目,截止日期,状态,优先级,任务内容,备注,创建时间\n';
        
        this.data.homeworkData.forEach(hw => {
            const tasks = hw.tasks.map(task => task.content).join('; ');
            const row = [
                hw.subject,
                hw.deadline,
                hw.status,
                hw.priority,
                tasks,
                hw.notes,
                hw.createdAt
            ].map(field => `"${field}"`).join(',');
            
            csv += row + '\n';
        });
        
        return csv;
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
            if (importData.homeworkData && Array.isArray(importData.homeworkData)) {
                this.data.homeworkData = this.validateAndNormalizeData(importData.homeworkData);
                
                if (this.autoSave) {
                    this.save();
                }
                
                this.notifyChange('dataImported', importData);
                console.log('作业数据导入成功');
                return true;
            } else {
                throw new Error('导入数据格式不正确');
            }
        } catch (error) {
            console.error('导入作业数据失败:', error);
            return false;
        }
    }
    
    /**
     * 数据变更通知
     * @param {string} action - 操作类型
     * @param {*} data - 相关数据
     */
    notifyChange(action, data) {
        const event = new CustomEvent('homeworkCache:change', {
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
        window.addEventListener('homeworkCache:change', callback);
    }
    
    /**
     * 移除数据变更监听
     * @param {Function} callback - 回调函数
     */
    offChange(callback) {
        window.removeEventListener('homeworkCache:change', callback);
    }
}

// 创建全局实例
const homeworkCache = new HomeworkCache();

// 兼容旧代码的全局函数
function getHomeworkData() {
    return homeworkCache.getAllHomework();
}

function setHomeworkData(data) {
    homeworkCache.data.homeworkData = homeworkCache.validateAndNormalizeData(data);
    return homeworkCache.save();
}

function saveHomeworkData() {
    return homeworkCache.save();
}

function loadHomeworkData() {
    return homeworkCache.getAllHomework();
}

// 全局暴露
if (typeof window !== 'undefined') {
    window.HomeworkCache = HomeworkCache;
    window.homeworkCache = homeworkCache;
}

console.log('作业数据缓存模块已加载');

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HomeworkCache, homeworkCache };
}