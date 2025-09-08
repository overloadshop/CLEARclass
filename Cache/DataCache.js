/**
 * 数据缓存管理模块
 * 统一管理班级管理系统中的各种数据缓存
 * 包括学生名单、课程表、值日数据等
 */

class DataCache {
    constructor() {
        this.cacheKeys = {
            STUDENT_LIST: 'studentList',
            CLASS_INFO: 'classInfo',
            SCHEDULE_DATA: 'scheduleData',
            TIME_SLOTS: 'timeSlots',
            DUTY_DATA: 'dutyData',
            DUTY_ITEMS: 'dutyItems',
            AVAILABLE_DUTY_ITEMS: 'availableDutyItems',
            AVAILABLE_TIME_SLOTS: 'availableTimeSlots',
            DUTY_POSITIONS: 'dutyPositions'
        };
        
        this.defaultData = {
            [this.cacheKeys.STUDENT_LIST]: [],
            [this.cacheKeys.CLASS_INFO]: {
                className: '',
                totalStudents: 0,
                maleStudents: 0,
                femaleStudents: 0
            },
            [this.cacheKeys.SCHEDULE_DATA]: {},
            [this.cacheKeys.TIME_SLOTS]: [],
            [this.cacheKeys.DUTY_DATA]: {},
            [this.cacheKeys.DUTY_ITEMS]: [],
            [this.cacheKeys.AVAILABLE_DUTY_ITEMS]: [],
            [this.cacheKeys.AVAILABLE_TIME_SLOTS]: [],
            [this.cacheKeys.DUTY_POSITIONS]: []
        };
    }
    
    /**
     * 获取缓存数据
     * @param {string} key - 缓存键名
     * @param {*} defaultValue - 默认值
     * @returns {*} 缓存的数据
     */
    get(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            if (data !== null) {
                return JSON.parse(data);
            }
            return defaultValue !== null ? defaultValue : this.defaultData[key] || null;
        } catch (error) {
            console.error(`获取缓存数据失败 [${key}]:`, error);
            return defaultValue !== null ? defaultValue : this.defaultData[key] || null;
        }
    }
    
    /**
     * 设置缓存数据
     * @param {string} key - 缓存键名
     * @param {*} value - 要缓存的数据
     * @returns {boolean} 是否设置成功
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            this.notifyDataChange(key, value);
            return true;
        } catch (error) {
            console.error(`设置缓存数据失败 [${key}]:`, error);
            return false;
        }
    }
    
    /**
     * 删除缓存数据
     * @param {string} key - 缓存键名
     * @returns {boolean} 是否删除成功
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            this.notifyDataChange(key, null);
            return true;
        } catch (error) {
            console.error(`删除缓存数据失败 [${key}]:`, error);
            return false;
        }
    }
    
    /**
     * 清空所有缓存数据
     * @returns {boolean} 是否清空成功
     */
    clear() {
        try {
            Object.values(this.cacheKeys).forEach(key => {
                localStorage.removeItem(key);
            });
            this.notifyDataChange('ALL', null);
            return true;
        } catch (error) {
            console.error('清空缓存数据失败:', error);
            return false;
        }
    }
    
    /**
     * 检查缓存是否存在
     * @param {string} key - 缓存键名
     * @returns {boolean} 是否存在
     */
    exists(key) {
        return localStorage.getItem(key) !== null;
    }
    
    /**
     * 获取缓存大小（字节）
     * @param {string} key - 缓存键名
     * @returns {number} 缓存大小
     */
    getSize(key) {
        const data = localStorage.getItem(key);
        return data ? new Blob([data]).size : 0;
    }
    
    /**
     * 获取所有缓存信息
     * @returns {Object} 缓存信息对象
     */
    getCacheInfo() {
        const info = {};
        Object.entries(this.cacheKeys).forEach(([name, key]) => {
            info[name] = {
                key: key,
                exists: this.exists(key),
                size: this.getSize(key),
                data: this.exists(key) ? this.get(key) : null
            };
        });
        return info;
    }
    
    /**
     * 数据变更通知
     * @param {string} key - 变更的键名
     * @param {*} value - 新值
     */
    notifyDataChange(key, value) {
        // 触发自定义事件，其他页面可以监听
        const event = new CustomEvent('dataCache:change', {
            detail: { key, value, timestamp: Date.now() }
        });
        window.dispatchEvent(event);
    }
    
    /**
     * 监听数据变更
     * @param {Function} callback - 回调函数
     */
    onDataChange(callback) {
        window.addEventListener('dataCache:change', callback);
    }
    
    /**
     * 移除数据变更监听
     * @param {Function} callback - 回调函数
     */
    offDataChange(callback) {
        window.removeEventListener('dataCache:change', callback);
    }
    
    // 便捷方法：学生名单相关
    getStudentList() {
        return this.get(this.cacheKeys.STUDENT_LIST, []);
    }
    
    setStudentList(students) {
        return this.set(this.cacheKeys.STUDENT_LIST, students);
    }
    
    addStudent(studentName) {
        const students = this.getStudentList();
        if (!students.includes(studentName)) {
            students.push(studentName);
            return this.setStudentList(students);
        }
        return false;
    }
    
    removeStudent(studentName) {
        const students = this.getStudentList();
        const index = students.indexOf(studentName);
        if (index > -1) {
            students.splice(index, 1);
            return this.setStudentList(students);
        }
        return false;
    }
    
    // 便捷方法：班级信息相关
    getClassInfo() {
        return this.get(this.cacheKeys.CLASS_INFO, this.defaultData[this.cacheKeys.CLASS_INFO]);
    }
    
    setClassInfo(classInfo) {
        return this.set(this.cacheKeys.CLASS_INFO, classInfo);
    }
    
    // 便捷方法：值日数据相关
    getDutyData() {
        return this.get(this.cacheKeys.DUTY_DATA, {});
    }
    
    setDutyData(dutyData) {
        return this.set(this.cacheKeys.DUTY_DATA, dutyData);
    }
    
    // 便捷方法：时间段数据相关
    getTimeSlots() {
        return this.get(this.cacheKeys.TIME_SLOTS, []);
    }
    
    setTimeSlots(timeSlots) {
        return this.set(this.cacheKeys.TIME_SLOTS, timeSlots);
    }
}

// 创建全局实例
const dataCache = new DataCache();

// 兼容旧代码的全局函数
function getStudentList() {
    return dataCache.getStudentList();
}

function setStudentList(students) {
    return dataCache.setStudentList(students);
}

// 导出模块（如果支持ES6模块）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DataCache, dataCache };
}

// 全局暴露
if (typeof window !== 'undefined') {
    window.DataCache = DataCache;
    window.dataCache = dataCache;
}

console.log('数据缓存模块已加载');