/**
 * 通知数据缓存管理模块
 * 专门处理班级通知、公告等数据的缓存操作
 */

class NoticeCache {
    constructor() {
        this.cacheKeys = {
            CLASS_NOTICES: 'classNotices'
        };
        
        this.data = {
            classNotices: []
        };
        
        this.autoSave = true;
        this.lastModified = null;
        
        // 初始化时加载数据
        this.load();
    }
    
    /**
     * 从localStorage加载通知数据
     */
    load() {
        try {
            const noticesData = localStorage.getItem(this.cacheKeys.CLASS_NOTICES);
            if (noticesData) {
                const loadedData = JSON.parse(noticesData);
                this.data.classNotices = this.validateAndNormalizeData(loadedData);
            }
            
            this.lastModified = Date.now();
            console.log('通知数据缓存加载完成');
            this.notifyChange('loaded', this.data.classNotices);
        } catch (error) {
            console.error('加载通知数据失败:', error);
            this.data.classNotices = [];
        }
    }
    
    /**
     * 验证和标准化通知数据
     * @param {Array} data - 原始数据
     * @returns {Array} 标准化后的数据
     */
    validateAndNormalizeData(data) {
        if (!Array.isArray(data)) {
            return [];
        }
        
        return data.map(notice => {
            if (typeof notice !== 'object' || notice === null) {
                return null;
            }
            
            return {
                id: notice.id || this.generateId(),
                title: notice.title || '',
                content: notice.content || '',
                type: notice.type || 'info', // info, warning, success, error
                priority: notice.priority || 'normal', // low, normal, high, urgent
                author: notice.author || '系统',
                createdAt: notice.createdAt || new Date().toISOString(),
                updatedAt: notice.updatedAt || new Date().toISOString(),
                isRead: notice.isRead || false,
                isPinned: notice.isPinned || false,
                expiresAt: notice.expiresAt || null,
                tags: notice.tags || [],
                attachments: notice.attachments || [],
                readBy: notice.readBy || [], // 已读用户列表
                status: notice.status || 'active' // active, archived, deleted
            };
        }).filter(notice => notice !== null);
    }
    
    /**
     * 生成唯一ID
     * @returns {string} 唯一ID
     */
    generateId() {
        return 'notice_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * 保存数据到localStorage
     */
    save() {
        try {
            localStorage.setItem(this.cacheKeys.CLASS_NOTICES, JSON.stringify(this.data.classNotices));
            
            this.lastModified = Date.now();
            this.notifyChange('saved', this.data.classNotices);
            console.log('通知数据已保存');
            return true;
        } catch (error) {
            console.error('保存通知数据失败:', error);
            return false;
        }
    }
    
    // ==================== 通知管理相关 ====================
    
    /**
     * 获取所有通知
     * @param {boolean} includeArchived - 是否包含已归档的通知
     * @returns {Array} 通知列表
     */
    getAllNotices(includeArchived = false) {
        if (includeArchived) {
            return [...this.data.classNotices];
        }
        return this.data.classNotices.filter(notice => notice.status === 'active');
    }
    
    /**
     * 根据ID获取通知
     * @param {string} id - 通知ID
     * @returns {Object|null} 通知对象
     */
    getNoticeById(id) {
        return this.data.classNotices.find(notice => notice.id === id) || null;
    }
    
    /**
     * 添加通知
     * @param {Object} notice - 通知对象
     * @returns {boolean} 是否添加成功
     */
    addNotice(notice) {
        if (!notice || typeof notice !== 'object') {
            console.warn('通知数据无效');
            return false;
        }
        
        const newNotice = {
            id: notice.id || this.generateId(),
            title: notice.title || '',
            content: notice.content || '',
            type: notice.type || 'info',
            priority: notice.priority || 'normal',
            author: notice.author || '系统',
            createdAt: notice.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isRead: notice.isRead || false,
            isPinned: notice.isPinned || false,
            expiresAt: notice.expiresAt || null,
            tags: notice.tags || [],
            attachments: notice.attachments || [],
            readBy: notice.readBy || [],
            status: notice.status || 'active'
        };
        
        this.data.classNotices.unshift(newNotice); // 新通知放在最前面
        
        if (this.autoSave) {
            this.save();
        }
        
        this.notifyChange('noticeAdded', newNotice);
        return true;
    }
    
    /**
     * 更新通知
     * @param {string} id - 通知ID
     * @param {Object} updates - 更新数据
     * @returns {boolean} 是否更新成功
     */
    updateNotice(id, updates) {
        const index = this.data.classNotices.findIndex(notice => notice.id === id);
        if (index === -1) {
            console.warn('通知不存在:', id);
            return false;
        }
        
        this.data.classNotices[index] = {
            ...this.data.classNotices[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        if (this.autoSave) {
            this.save();
        }
        
        this.notifyChange('noticeUpdated', { id, updates });
        return true;
    }
    
    /**
     * 删除通知
     * @param {string} id - 通知ID
     * @param {boolean} permanent - 是否永久删除
     * @returns {boolean} 是否删除成功
     */
    removeNotice(id, permanent = false) {
        const index = this.data.classNotices.findIndex(notice => notice.id === id);
        if (index === -1) {
            console.warn('通知不存在:', id);
            return false;
        }
        
        if (permanent) {
            // 永久删除
            const removedNotice = this.data.classNotices.splice(index, 1)[0];
            this.notifyChange('noticeRemoved', removedNotice);
        } else {
            // 标记为已删除
            this.data.classNotices[index].status = 'deleted';
            this.data.classNotices[index].updatedAt = new Date().toISOString();
            this.notifyChange('noticeArchived', this.data.classNotices[index]);
        }
        
        if (this.autoSave) {
            this.save();
        }
        
        return true;
    }
    
    /**
     * 恢复已删除的通知
     * @param {string} id - 通知ID
     * @returns {boolean} 是否恢复成功
     */
    restoreNotice(id) {
        return this.updateNotice(id, { status: 'active' });
    }
    
    /**
     * 清空所有通知
     * @param {boolean} permanent - 是否永久清空
     * @returns {boolean} 是否清空成功
     */
    clearAllNotices(permanent = false) {
        if (permanent) {
            this.data.classNotices = [];
        } else {
            this.data.classNotices.forEach(notice => {
                notice.status = 'deleted';
                notice.updatedAt = new Date().toISOString();
            });
        }
        
        if (this.autoSave) {
            this.save();
        }
        
        this.notifyChange('allNoticesCleared', { permanent });
        return true;
    }
    
    // ==================== 通知状态管理 ====================
    
    /**
     * 标记通知为已读
     * @param {string} id - 通知ID
     * @param {string} userId - 用户ID（可选）
     * @returns {boolean} 是否标记成功
     */
    markAsRead(id, userId = 'default') {
        const notice = this.getNoticeById(id);
        if (!notice) {
            return false;
        }
        
        notice.isRead = true;
        if (!notice.readBy.includes(userId)) {
            notice.readBy.push(userId);
        }
        
        return this.updateNotice(id, { isRead: true, readBy: notice.readBy });
    }
    
    /**
     * 标记通知为未读
     * @param {string} id - 通知ID
     * @param {string} userId - 用户ID（可选）
     * @returns {boolean} 是否标记成功
     */
    markAsUnread(id, userId = 'default') {
        const notice = this.getNoticeById(id);
        if (!notice) {
            return false;
        }
        
        notice.isRead = false;
        notice.readBy = notice.readBy.filter(uid => uid !== userId);
        
        return this.updateNotice(id, { isRead: false, readBy: notice.readBy });
    }
    
    /**
     * 置顶/取消置顶通知
     * @param {string} id - 通知ID
     * @param {boolean} pinned - 是否置顶
     * @returns {boolean} 是否操作成功
     */
    setPinned(id, pinned = true) {
        return this.updateNotice(id, { isPinned: pinned });
    }
    
    // ==================== 搜索和筛选 ====================
    
    /**
     * 搜索通知
     * @param {string} keyword - 搜索关键词
     * @returns {Array} 匹配的通知列表
     */
    searchNotices(keyword) {
        if (!keyword) {
            return this.getAllNotices();
        }
        
        const lowerKeyword = keyword.toLowerCase();
        
        return this.data.classNotices.filter(notice => {
            return notice.status === 'active' && (
                notice.title.toLowerCase().includes(lowerKeyword) ||
                notice.content.toLowerCase().includes(lowerKeyword) ||
                notice.author.toLowerCase().includes(lowerKeyword) ||
                notice.tags.some(tag => 
                    tag.toLowerCase().includes(lowerKeyword)
                )
            );
        });
    }
    
    /**
     * 按类型筛选通知
     * @param {string} type - 通知类型
     * @returns {Array} 筛选后的通知列表
     */
    getNoticesByType(type) {
        return this.data.classNotices.filter(notice => 
            notice.status === 'active' && notice.type === type
        );
    }
    
    /**
     * 按优先级筛选通知
     * @param {string} priority - 优先级
     * @returns {Array} 筛选后的通知列表
     */
    getNoticesByPriority(priority) {
        return this.data.classNotices.filter(notice => 
            notice.status === 'active' && notice.priority === priority
        );
    }
    
    /**
     * 获取未读通知
     * @param {string} userId - 用户ID（可选）
     * @returns {Array} 未读通知列表
     */
    getUnreadNotices(userId = 'default') {
        return this.data.classNotices.filter(notice => 
            notice.status === 'active' && !notice.readBy.includes(userId)
        );
    }
    
    /**
     * 获取置顶通知
     * @returns {Array} 置顶通知列表
     */
    getPinnedNotices() {
        return this.data.classNotices.filter(notice => 
            notice.status === 'active' && notice.isPinned
        ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }
    
    /**
     * 获取即将过期的通知
     * @param {number} days - 天数
     * @returns {Array} 即将过期的通知列表
     */
    getExpiringNotices(days = 3) {
        const now = new Date();
        const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        
        return this.data.classNotices.filter(notice => {
            if (!notice.expiresAt || notice.status !== 'active') return false;
            
            const expiresAt = new Date(notice.expiresAt);
            return expiresAt >= now && expiresAt <= futureDate;
        }).sort((a, b) => new Date(a.expiresAt) - new Date(b.expiresAt));
    }
    
    // ==================== 统计功能 ====================
    
    /**
     * 获取通知统计信息
     * @returns {Object} 统计信息
     */
    getStatistics() {
        const total = this.data.classNotices.filter(n => n.status === 'active').length;
        const unread = this.getUnreadNotices().length;
        const pinned = this.getPinnedNotices().length;
        const expiring = this.getExpiringNotices().length;
        const archived = this.data.classNotices.filter(n => n.status === 'deleted').length;
        
        // 按类型统计
        const typeStats = {
            info: this.getNoticesByType('info').length,
            warning: this.getNoticesByType('warning').length,
            success: this.getNoticesByType('success').length,
            error: this.getNoticesByType('error').length
        };
        
        // 按优先级统计
        const priorityStats = {
            urgent: this.getNoticesByPriority('urgent').length,
            high: this.getNoticesByPriority('high').length,
            normal: this.getNoticesByPriority('normal').length,
            low: this.getNoticesByPriority('low').length
        };
        
        return {
            total,
            unread,
            pinned,
            expiring,
            archived,
            readRate: total > 0 ? ((total - unread) / total * 100).toFixed(1) : 0,
            typeStats,
            priorityStats
        };
    }
    
    /**
     * 获取所有作者列表
     * @returns {Array} 作者列表
     */
    getAllAuthors() {
        const authors = new Set();
        this.data.classNotices.forEach(notice => {
            if (notice.author) {
                authors.add(notice.author);
            }
        });
        return Array.from(authors).sort();
    }
    
    /**
     * 获取所有标签列表
     * @returns {Array} 标签列表
     */
    getAllTags() {
        const tags = new Set();
        this.data.classNotices.forEach(notice => {
            notice.tags.forEach(tag => tags.add(tag));
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
                noticesCount: this.data.classNotices.length,
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
            localStorage.removeItem(this.cacheKeys.CLASS_NOTICES);
            this.data.classNotices = [];
            
            this.notifyChange('allCleared', []);
            console.log('所有通知数据已清空');
            return true;
        } catch (error) {
            console.error('清空通知数据失败:', error);
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
            classNotices: this.data.classNotices,
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
        let csv = '标题,内容,类型,优先级,作者,创建时间,状态,是否置顶\n';
        
        this.data.classNotices.forEach(notice => {
            const row = [
                notice.title,
                notice.content.replace(/\n/g, ' '), // 移除换行符
                notice.type,
                notice.priority,
                notice.author,
                notice.createdAt,
                notice.status,
                notice.isPinned ? '是' : '否'
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
            if (importData.classNotices && Array.isArray(importData.classNotices)) {
                this.data.classNotices = this.validateAndNormalizeData(importData.classNotices);
                
                if (this.autoSave) {
                    this.save();
                }
                
                this.notifyChange('dataImported', importData);
                console.log('通知数据导入成功');
                return true;
            } else {
                throw new Error('导入数据格式不正确');
            }
        } catch (error) {
            console.error('导入通知数据失败:', error);
            return false;
        }
    }
    
    /**
     * 数据变更通知
     * @param {string} action - 操作类型
     * @param {*} data - 相关数据
     */
    notifyChange(action, data) {
        const event = new CustomEvent('noticeCache:change', {
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
        window.addEventListener('noticeCache:change', callback);
    }
    
    /**
     * 移除数据变更监听
     * @param {Function} callback - 回调函数
     */
    offChange(callback) {
        window.removeEventListener('noticeCache:change', callback);
    }
}

// 创建全局实例
const noticeCache = new NoticeCache();

// 兼容旧代码的全局函数
function saveNoticeToStorage(notice) {
    return noticeCache.addNotice(notice);
}

function removeNoticeFromStorage(noticeId) {
    return noticeCache.removeNotice(noticeId, true); // 永久删除
}

function updateNoticeInStorage(noticeId, updates) {
    return noticeCache.updateNotice(noticeId, updates);
}

function loadNoticesFromStorage() {
    return noticeCache.getAllNotices();
}

// 全局暴露
if (typeof window !== 'undefined') {
    window.NoticeCache = NoticeCache;
    window.noticeCache = noticeCache;
}

console.log('通知数据缓存模块已加载');

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NoticeCache, noticeCache };
}