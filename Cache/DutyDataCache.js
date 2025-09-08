/**
 * 值日数据缓存管理模块
 * 专门处理值日表相关数据的缓存操作
 */

class DutyDataCache {
    constructor() {
        this.cacheKeys = {
            DUTY_DATA: 'dutyData',
            TIME_SLOTS: 'dutyTimeSlots',
            AVAILABLE_TIME_SLOTS: 'dutyAvailableTimeSlots',
            DUTY_ITEMS: 'dutyItems',
            AVAILABLE_DUTY_ITEMS: 'availableDutyItems',
            DUTY_POSITIONS: 'dutyPositions'
        };
        
        this.data = {
            dutyData: {},
            timeSlots: [],
            availableTimeSlots: [],
            dutyItems: [],
            availableDutyItems: [],
            dutyPositions: []
        };
        
        this.autoSave = true;
        this.lastModified = null;
        
        // 初始化时加载数据
        this.load();
    }
    
    /**
     * 从localStorage加载所有值日相关数据
     */
    load() {
        try {
            // 手动映射缓存键到数据字段
            const keyMapping = {
                'DUTY_DATA': 'dutyData',
                'TIME_SLOTS': 'timeSlots',
                'AVAILABLE_TIME_SLOTS': 'availableTimeSlots',
                'DUTY_ITEMS': 'dutyItems',
                'AVAILABLE_DUTY_ITEMS': 'availableDutyItems',
                'DUTY_POSITIONS': 'dutyPositions'
            };
            
            Object.keys(this.cacheKeys).forEach(key => {
                const cacheKey = this.cacheKeys[key];
                const dataKey = keyMapping[key];
                
                if (dataKey) {
                    const saved = localStorage.getItem(cacheKey);
                    if (saved && saved !== 'undefined' && saved !== 'null' && saved.trim() !== '') {
                        try {
                            this.data[dataKey] = JSON.parse(saved);
                        } catch (parseError) {
                            console.warn(`解析${cacheKey}数据失败，使用默认值:`, parseError);
                            this.setDefaultValue(dataKey);
                        }
                    } else {
                        // 设置默认值
                        this.setDefaultValue(dataKey);
                    }
                }
            });
            
            this.lastModified = Date.now();
            console.log('值日数据缓存加载完成');
            this.notifyChange('loaded', this.data);
        } catch (error) {
            console.error('加载值日数据失败:', error);
            this.setAllDefaults();
        }
    }
    
    /**
     * 设置默认值
     */
    setDefaultValue(dataKey) {
        switch (dataKey) {
            case 'dutydata':
                this.data.dutyData = {};
                break;
            case 'timeslots':
                this.data.timeSlots = [];
                break;
            case 'availabletimeslots':
                this.data.availableTimeSlots = [];
                break;
            case 'dutyitems':
                this.data.dutyItems = [];
                break;
            case 'availabledutyitems':
                this.data.availableDutyItems = [];
                break;
            case 'dutypositions':
                this.data.dutyPositions = [
                    { name: '组长', time: '全天', description: '负责值日工作的组织和协调' }
                ];
                break;
        }
    }
    
    /**
     * 设置所有默认值
     */
    setAllDefaults() {
        Object.keys(this.data).forEach(key => {
            this.setDefaultValue(key);
        });
    }
    
    /**
     * 保存数据到localStorage
     */
    save() {
        try {
            // 手动映射缓存键到数据字段
            const keyMapping = {
                'DUTY_DATA': 'dutyData',
                'TIME_SLOTS': 'timeSlots',
                'AVAILABLE_TIME_SLOTS': 'availableTimeSlots',
                'DUTY_ITEMS': 'dutyItems',
                'AVAILABLE_DUTY_ITEMS': 'availableDutyItems',
                'DUTY_POSITIONS': 'dutyPositions'
            };
            
            Object.keys(this.cacheKeys).forEach(key => {
                const cacheKey = this.cacheKeys[key];
                const dataKey = keyMapping[key];
                
                if (dataKey && this.data[dataKey] !== undefined) {
                    localStorage.setItem(cacheKey, JSON.stringify(this.data[dataKey]));
                }
            });
            
            this.lastModified = Date.now();
            this.notifyChange('saved', this.data);
            console.log('值日数据已保存');
            return true;
        } catch (error) {
            console.error('保存值日数据失败:', error);
            return false;
        }
    }
    
    // ==================== 值日分配数据相关 ====================
    
    /**
     * 获取值日分配数据
     * @returns {Object} 值日分配数据
     */
    getDutyData() {
        return { ...this.data.dutyData };
    }
    
    /**
     * 设置值日分配数据
     * @param {Object} dutyData - 值日分配数据
     * @returns {boolean} 是否设置成功
     */
    setDutyData(dutyData) {
        if (typeof dutyData !== 'object' || dutyData === null) {
            console.warn('值日数据必须是对象');
            return false;
        }
        
        this.data.dutyData = { ...dutyData };
        
        if (this.autoSave) {
            this.save();
        }
        
        this.notifyChange('dutyDataChanged', this.data.dutyData);
        return true;
    }
    
    /**
     * 添加或更新值日分配
     * @param {string} key - 分配键名 (如: "0-1")
     * @param {Object} assignment - 分配信息
     * @returns {boolean} 是否操作成功
     */
    setDutyAssignment(key, assignment) {
        if (!key || typeof assignment !== 'object') {
            console.warn('无效的值日分配参数');
            return false;
        }
        
        this.data.dutyData[key] = { ...assignment };
        
        if (this.autoSave) {
            this.save();
        }
        
        this.notifyChange('assignmentChanged', { key, assignment });
        return true;
    }
    
    /**
     * 删除值日分配
     * @param {string} key - 分配键名
     * @returns {boolean} 是否删除成功
     */
    removeDutyAssignment(key) {
        if (!key || !(key in this.data.dutyData)) {
            console.warn('值日分配不存在:', key);
            return false;
        }
        
        delete this.data.dutyData[key];
        
        if (this.autoSave) {
            this.save();
        }
        
        this.notifyChange('assignmentRemoved', key);
        return true;
    }
    
    /**
     * 清空所有值日分配
     * @returns {boolean} 是否清空成功
     */
    clearDutyData() {
        this.data.dutyData = {};
        
        if (this.autoSave) {
            this.save();
        }
        
        this.notifyChange('dutyDataCleared', {});
        return true;
    }
    
    // ==================== 时间段相关 ====================
    
    /**
     * 获取活跃时间段
     * @returns {Array} 时间段数组
     */
    getTimeSlots() {
        return [...this.data.timeSlots];
    }
    
    /**
     * 设置活跃时间段
     * @param {Array} timeSlots - 时间段数组
     * @returns {boolean} 是否设置成功
     */
    setTimeSlots(timeSlots) {
        if (!Array.isArray(timeSlots)) {
            console.warn('时间段必须是数组');
            return false;
        }
        
        this.data.timeSlots = [...timeSlots];
        
        if (this.autoSave) {
            this.save();
        }
        
        this.notifyChange('timeSlotsChanged', this.data.timeSlots);
        return true;
    }
    
    /**
     * 获取候选时间段
     * @returns {Array} 候选时间段数组
     */
    getAvailableTimeSlots() {
        return [...this.data.availableTimeSlots];
    }
    
    /**
     * 设置候选时间段
     * @param {Array} timeSlots - 候选时间段数组
     * @returns {boolean} 是否设置成功
     */
    setAvailableTimeSlots(timeSlots) {
        if (!Array.isArray(timeSlots)) {
            console.warn('候选时间段必须是数组');
            return false;
        }
        
        this.data.availableTimeSlots = [...timeSlots];
        
        if (this.autoSave) {
            this.save();
        }
        
        this.notifyChange('availableTimeSlotsChanged', this.data.availableTimeSlots);
        return true;
    }
    
    /**
     * 添加候选时间段
     * @param {Object} timeSlot - 时间段对象
     * @returns {boolean} 是否添加成功
     */
    addAvailableTimeSlot(timeSlot) {
        if (!timeSlot || !timeSlot.name) {
            console.warn('无效的时间段对象');
            return false;
        }
        
        // 检查是否已存在
        const exists = this.data.availableTimeSlots.some(slot => 
            slot.name === timeSlot.name
        );
        
        if (exists) {
            console.warn('时间段已存在:', timeSlot.name);
            return false;
        }
        
        this.data.availableTimeSlots.push({ ...timeSlot });
        
        if (this.autoSave) {
            this.save();
        }
        
        this.notifyChange('availableTimeSlotAdded', timeSlot);
        return true;
    }
    
    // ==================== 值日项目相关 ====================
    
    /**
     * 获取候选值日项目
     * @returns {Array} 候选值日项目数组
     */
    getAvailableDutyItems() {
        return [...this.data.availableDutyItems];
    }
    
    /**
     * 设置候选值日项目
     * @param {Array} items - 候选值日项目数组
     * @returns {boolean} 是否设置成功
     */
    setAvailableDutyItems(items) {
        if (!Array.isArray(items)) {
            console.warn('候选值日项目必须是数组');
            return false;
        }
        
        this.data.availableDutyItems = [...items];
        
        if (this.autoSave) {
            this.save();
        }
        
        this.notifyChange('availableDutyItemsChanged', this.data.availableDutyItems);
        return true;
    }
    
    /**
     * 添加候选值日项目
     * @param {string} itemName - 项目名称
     * @returns {boolean} 是否添加成功
     */
    addAvailableDutyItem(itemName) {
        if (!itemName || typeof itemName !== 'string') {
            console.warn('项目名称无效');
            return false;
        }
        
        const name = itemName.trim();
        if (!name) {
            console.warn('项目名称不能为空');
            return false;
        }
        
        if (this.data.availableDutyItems.includes(name)) {
            console.warn('项目已存在:', name);
            return false;
        }
        
        this.data.availableDutyItems.push(name);
        
        if (this.autoSave) {
            this.save();
        }
        
        this.notifyChange('availableDutyItemAdded', name);
        return true;
    }
    
    /**
     * 删除候选值日项目
     * @param {string} itemName - 项目名称
     * @returns {boolean} 是否删除成功
     */
    removeAvailableDutyItem(itemName) {
        const index = this.data.availableDutyItems.indexOf(itemName);
        if (index === -1) {
            console.warn('项目不存在:', itemName);
            return false;
        }
        
        this.data.availableDutyItems.splice(index, 1);
        
        if (this.autoSave) {
            this.save();
        }
        
        this.notifyChange('availableDutyItemRemoved', itemName);
        return true;
    }
    
    // ==================== 值日职位相关 ====================
    
    /**
     * 获取值日职位
     * @returns {Array} 值日职位数组
     */
    getDutyPositions() {
        return [...this.data.dutyPositions];
    }
    
    /**
     * 设置值日职位
     * @param {Array} positions - 值日职位数组
     * @returns {boolean} 是否设置成功
     */
    setDutyPositions(positions) {
        if (!Array.isArray(positions)) {
            console.warn('值日职位必须是数组');
            return false;
        }
        
        this.data.dutyPositions = [...positions];
        
        if (this.autoSave) {
            this.save();
        }
        
        this.notifyChange('dutyPositionsChanged', this.data.dutyPositions);
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
                dutyDataCount: Object.keys(this.data.dutyData).length,
                timeSlotsCount: this.data.timeSlots.length,
                availableTimeSlotsCount: this.data.availableTimeSlots.length,
                dutyItemsCount: this.data.dutyItems.length,
                availableDutyItemsCount: this.data.availableDutyItems.length,
                dutyPositionsCount: this.data.dutyPositions.length
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
            
            this.setAllDefaults();
            this.lastModified = Date.now();
            
            this.notifyChange('allCleared', {});
            console.log('所有值日数据已清空');
            return true;
        } catch (error) {
            console.error('清空值日数据失败:', error);
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
            Object.keys(this.data).forEach(key => {
                if (importData[key] !== undefined) {
                    this.data[key] = importData[key];
                }
            });
            
            if (this.autoSave) {
                this.save();
            }
            
            this.notifyChange('dataImported', importData);
            console.log('值日数据导入成功');
            return true;
        } catch (error) {
            console.error('导入值日数据失败:', error);
            return false;
        }
    }
    
    /**
     * 数据变更通知
     * @param {string} action - 操作类型
     * @param {*} data - 相关数据
     */
    notifyChange(action, data) {
        const event = new CustomEvent('dutyDataCache:change', {
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
        window.addEventListener('dutyDataCache:change', callback);
    }
    
    /**
     * 移除数据变更监听
     * @param {Function} callback - 回调函数
     */
    offChange(callback) {
        window.removeEventListener('dutyDataCache:change', callback);
    }
}

// 创建全局实例
const dutyDataCache = new DutyDataCache();

// 兼容旧代码的全局函数
function getDutyData() {
    return dutyDataCache.getDutyData();
}

function setDutyData(data) {
    return dutyDataCache.setDutyData(data);
}

function saveDutyData() {
    return dutyDataCache.save();
}

// 全局暴露
if (typeof window !== 'undefined') {
    window.DutyDataCache = DutyDataCache;
    window.dutyDataCache = dutyDataCache;
}

console.log('值日数据缓存模块已加载');

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DutyDataCache, dutyDataCache };
}