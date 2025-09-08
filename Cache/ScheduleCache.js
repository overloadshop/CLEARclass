/**
 * 课程表数据缓存管理模块
 * 专门处理课程表、时间段、星期等数据的缓存操作
 */

class ScheduleCache {
    constructor() {
        this.cacheKeys = {
            SCHEDULE_DATA: 'scheduleData',
            TIME_SLOTS: 'timeSlots',
            WEEK_DAYS: 'weekDays'
        };
        
        this.data = {
            scheduleData: {},
            timeSlots: [
                { name: '第1节课', start: '08:00', end: '08:45', type: 'class' },
                { name: '课间操', start: '08:45', end: '08:55', type: 'break' },
                { name: '第2节课', start: '08:55', end: '09:40', type: 'class' },
                { name: '大课间', start: '09:40', end: '10:00', type: 'break' },
                { name: '第3节课', start: '10:00', end: '10:45', type: 'class' },
                { name: '第4节课', start: '10:55', end: '11:40', type: 'class' },
                { name: '午休', start: '12:00', end: '14:00', type: 'lunch' },
                { name: '第5节课', start: '14:00', end: '14:45', type: 'class' },
                { name: '第6节课', start: '14:55', end: '15:40', type: 'class' },
                { name: '第7节课', start: '15:50', end: '16:35', type: 'class' },
                { name: '第8节课', start: '16:45', end: '17:30', type: 'class' }
            ],
            weekDays: ['周一', '周二', '周三', '周四', '周五']
        };
        
        this.autoSave = true;
        this.lastModified = null;
        
        // 初始化时加载数据
        this.load();
    }
    
    /**
     * 从localStorage加载所有课程表数据
     */
    load() {
        try {
            // 加载课程表数据
            const scheduleData = localStorage.getItem(this.cacheKeys.SCHEDULE_DATA);
            if (scheduleData) {
                this.data.scheduleData = JSON.parse(scheduleData);
            }
            
            // 加载时间段
            const timeSlots = localStorage.getItem(this.cacheKeys.TIME_SLOTS);
            if (timeSlots) {
                this.data.timeSlots = JSON.parse(timeSlots);
            } else {
                // 如果没有保存的时间段数据，保存默认时间段到localStorage
                this.save();
            }
            
            // 加载星期设置
            const weekDays = localStorage.getItem(this.cacheKeys.WEEK_DAYS);
            if (weekDays) {
                this.data.weekDays = JSON.parse(weekDays);
            }
            
            this.lastModified = Date.now();
            console.log('课程表缓存加载完成');
            this.notifyChange('loaded', this.data);
        } catch (error) {
            console.error('加载课程表数据失败:', error);
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
            localStorage.setItem(this.cacheKeys.SCHEDULE_DATA, JSON.stringify(this.data.scheduleData));
            localStorage.setItem(this.cacheKeys.TIME_SLOTS, JSON.stringify(this.data.timeSlots));
            localStorage.setItem(this.cacheKeys.WEEK_DAYS, JSON.stringify(this.data.weekDays));
            
            this.lastModified = Date.now();
            this.notifyChange('saved', this.data);
            console.log('课程表数据已保存');
            return true;
        } catch (error) {
            console.error('保存课程表数据失败:', error);
            return false;
        }
    }
    
    // ==================== 课程表数据相关 ====================
    
    /**
     * 获取课程表数据
     * @returns {Object} 课程表数据
     */
    getScheduleData() {
        return { ...this.data.scheduleData };
    }
    
    /**
     * 设置课程表数据
     * @param {Object} scheduleData - 课程表数据
     * @returns {boolean} 是否设置成功
     */
    setScheduleData(scheduleData) {
        if (typeof scheduleData !== 'object' || scheduleData === null) {
            console.warn('课程表数据必须是对象');
            return false;
        }
        
        this.data.scheduleData = { ...scheduleData };
        
        if (this.autoSave) {
            this.save();
        }
        
        this.notifyChange('scheduleDataChanged', this.data.scheduleData);
        return true;
    }
    
    /**
     * 获取特定位置的课程
     * @param {number} timeIndex - 时间段索引
     * @param {number} dayIndex - 星期索引
     * @returns {Object|null} 课程信息
     */
    getCourse(timeIndex, dayIndex) {
        const key = `${timeIndex}-${dayIndex}`;
        return this.data.scheduleData[key] || null;
    }
    
    /**
     * 设置特定位置的课程
     * @param {number} timeIndex - 时间段索引
     * @param {number} dayIndex - 星期索引
     * @param {Object} course - 课程信息
     * @returns {boolean} 是否设置成功
     */
    setCourse(timeIndex, dayIndex, course) {
        if (typeof course !== 'object' || course === null) {
            console.warn('课程信息必须是对象');
            return false;
        }
        
        const key = `${timeIndex}-${dayIndex}`;
        this.data.scheduleData[key] = { ...course };
        
        if (this.autoSave) {
            this.save();
        }
        
        this.notifyChange('courseChanged', { key, course });
        return true;
    }
    
    /**
     * 删除特定位置的课程
     * @param {number} timeIndex - 时间段索引
     * @param {number} dayIndex - 星期索引
     * @returns {boolean} 是否删除成功
     */
    removeCourse(timeIndex, dayIndex) {
        const key = `${timeIndex}-${dayIndex}`;
        
        if (!(key in this.data.scheduleData)) {
            console.warn('课程不存在:', key);
            return false;
        }
        
        delete this.data.scheduleData[key];
        
        if (this.autoSave) {
            this.save();
        }
        
        this.notifyChange('courseRemoved', key);
        return true;
    }
    
    /**
     * 清空所有课程
     * @returns {boolean} 是否清空成功
     */
    clearSchedule() {
        this.data.scheduleData = {};
        
        if (this.autoSave) {
            this.save();
        }
        
        this.notifyChange('scheduleCleared', {});
        return true;
    }
    
    /**
     * 搜索课程
     * @param {string} keyword - 搜索关键词
     * @returns {Array} 匹配的课程列表
     */
    searchCourses(keyword) {
        if (!keyword) {
            return [];
        }
        
        const results = [];
        const lowerKeyword = keyword.toLowerCase();
        
        Object.entries(this.data.scheduleData).forEach(([key, course]) => {
            const [timeIndex, dayIndex] = key.split('-').map(Number);
            
            if (course.subject && course.subject.toLowerCase().includes(lowerKeyword) ||
                course.teacher && course.teacher.toLowerCase().includes(lowerKeyword) ||
                course.classroom && course.classroom.toLowerCase().includes(lowerKeyword)) {
                
                results.push({
                    key,
                    timeIndex,
                    dayIndex,
                    course
                });
            }
        });
        
        return results;
    }
    
    /**
     * 获取某个时间段的所有课程
     * @param {number} timeIndex - 时间段索引
     * @returns {Array} 课程列表
     */
    getCoursesByTime(timeIndex) {
        const courses = [];
        
        this.data.weekDays.forEach((day, dayIndex) => {
            const course = this.getCourse(timeIndex, dayIndex);
            if (course) {
                courses.push({
                    dayIndex,
                    day,
                    course
                });
            }
        });
        
        return courses;
    }
    
    /**
     * 获取某一天的所有课程
     * @param {number} dayIndex - 星期索引
     * @returns {Array} 课程列表
     */
    getCoursesByDay(dayIndex) {
        const courses = [];
        
        this.data.timeSlots.forEach((timeSlot, timeIndex) => {
            const course = this.getCourse(timeIndex, dayIndex);
            if (course) {
                courses.push({
                    timeIndex,
                    timeSlot,
                    course
                });
            }
        });
        
        return courses;
    }
    
    // ==================== 时间段相关 ====================
    
    /**
     * 获取时间段
     * @returns {Array} 时间段数组
     */
    getTimeSlots() {
        return [...this.data.timeSlots];
    }
    
    /**
     * 设置时间段
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
     * 添加时间段
     * @param {Object} timeSlot - 时间段对象
     * @returns {boolean} 是否添加成功
     */
    addTimeSlot(timeSlot) {
        if (!timeSlot || !timeSlot.name) {
            console.warn('无效的时间段对象');
            return false;
        }
        
        // 检查是否已存在
        const exists = this.data.timeSlots.some(slot => 
            slot.name === timeSlot.name
        );
        
        if (exists) {
            console.warn('时间段已存在:', timeSlot.name);
            return false;
        }
        
        this.data.timeSlots.push({ ...timeSlot });
        
        if (this.autoSave) {
            this.save();
        }
        
        this.notifyChange('timeSlotAdded', timeSlot);
        return true;
    }
    
    /**
     * 删除时间段
     * @param {number} index - 时间段索引
     * @returns {boolean} 是否删除成功
     */
    removeTimeSlot(index) {
        if (index < 0 || index >= this.data.timeSlots.length) {
            console.warn('时间段索引无效:', index);
            return false;
        }
        
        const removedSlot = this.data.timeSlots.splice(index, 1)[0];
        
        // 删除相关的课程数据
        this.data.weekDays.forEach((day, dayIndex) => {
            const key = `${index}-${dayIndex}`;
            if (key in this.data.scheduleData) {
                delete this.data.scheduleData[key];
            }
        });
        
        // 重新索引后续时间段的课程数据
        const newScheduleData = {};
        Object.entries(this.data.scheduleData).forEach(([key, course]) => {
            const [timeIndex, dayIndex] = key.split('-').map(Number);
            if (timeIndex > index) {
                // 时间段索引减1
                const newKey = `${timeIndex - 1}-${dayIndex}`;
                newScheduleData[newKey] = course;
            } else if (timeIndex < index) {
                // 保持原索引
                newScheduleData[key] = course;
            }
            // timeIndex === index 的课程已被删除
        });
        this.data.scheduleData = newScheduleData;
        
        if (this.autoSave) {
            this.save();
        }
        
        this.notifyChange('timeSlotRemoved', { index, removedSlot });
        return true;
    }
    
    // ==================== 星期设置相关 ====================
    
    /**
     * 获取星期设置
     * @returns {Array} 星期数组
     */
    getWeekDays() {
        return [...this.data.weekDays];
    }
    
    /**
     * 设置星期
     * @param {Array} weekDays - 星期数组
     * @returns {boolean} 是否设置成功
     */
    setWeekDays(weekDays) {
        if (!Array.isArray(weekDays)) {
            console.warn('星期设置必须是数组');
            return false;
        }
        
        this.data.weekDays = [...weekDays];
        
        if (this.autoSave) {
            this.save();
        }
        
        this.notifyChange('weekDaysChanged', this.data.weekDays);
        return true;
    }
    
    // ==================== 工具方法 ====================
    
    /**
     * 获取课程统计信息
     * @returns {Object} 统计信息
     */
    getStatistics() {
        const totalSlots = this.data.timeSlots.length * this.data.weekDays.length;
        const filledSlots = Object.keys(this.data.scheduleData).length;
        const emptySlots = totalSlots - filledSlots;
        
        // 统计科目
        const subjects = {};
        const teachers = {};
        const classrooms = {};
        
        Object.values(this.data.scheduleData).forEach(course => {
            if (course.subject) {
                subjects[course.subject] = (subjects[course.subject] || 0) + 1;
            }
            if (course.teacher) {
                teachers[course.teacher] = (teachers[course.teacher] || 0) + 1;
            }
            if (course.classroom) {
                classrooms[course.classroom] = (classrooms[course.classroom] || 0) + 1;
            }
        });
        
        return {
            totalSlots,
            filledSlots,
            emptySlots,
            fillRate: totalSlots > 0 ? (filledSlots / totalSlots * 100).toFixed(1) : 0,
            subjects: Object.keys(subjects).length,
            teachers: Object.keys(teachers).length,
            classrooms: Object.keys(classrooms).length,
            subjectDistribution: subjects,
            teacherDistribution: teachers,
            classroomDistribution: classrooms
        };
    }
    
    /**
     * 获取当前课程
     * @returns {string} 当前课程名称
     */
    getCurrentCourse() {
        try {
            // 检查是否有课程表数据
            if (!this.data.scheduleData || Object.keys(this.data.scheduleData).length === 0) {
                return '--';
            }
            
            // 检查是否有时间段数据
            if (!this.data.timeSlots || this.data.timeSlots.length === 0) {
                return '--';
            }
            
            const now = new Date();
            const currentDay = now.getDay(); // 0=周日, 1=周一, ..., 6=周六
            const currentTime = now.getHours() * 60 + now.getMinutes(); // 当前时间（分钟）
            
            // 转换为课程表的星期格式（0=周一, ..., 4=周五）
            const dayMap = [6, 0, 1, 2, 3, 4, 5]; // 将JS的星期转换为课程表格式
            const scheduleDay = dayMap[currentDay];
            
            // 如果是周末，返回非上课时间
            if (scheduleDay >= this.data.weekDays.length) {
                return '非上课时间';
            }
            
            // 查找当前时间段
            for (let timeIndex = 0; timeIndex < this.data.timeSlots.length; timeIndex++) {
                const slot = this.data.timeSlots[timeIndex];
                // 兼容不同的时间字段格式
                const startTime = slot.start || slot.startTime;
                const endTime = slot.end || slot.endTime;
                if (!startTime || !endTime) continue;
                
                const [startHour, startMin] = startTime.split(':').map(Number);
                const [endHour, endMin] = endTime.split(':').map(Number);
                const startMinutes = startHour * 60 + startMin;
                const endMinutes = endHour * 60 + endMin;
                
                if (currentTime >= startMinutes && currentTime <= endMinutes) {
                    // 在这个时间段内，查找对应的课程
                    const course = this.getCourse(timeIndex, scheduleDay);
                    if (course && course.subject) {
                        return course.subject;
                    }
                    return '暂无课程';
                }
            }
            
            return '非上课时间';
        } catch (e) {
            console.error('获取当前课程失败:', e);
            return '--';
        }
    }
    
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
                timeSlotsCount: this.data.timeSlots.length,
                weekDaysCount: this.data.weekDays.length,
                coursesCount: Object.keys(this.data.scheduleData).length,
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
            Object.values(this.cacheKeys).forEach(key => {
                localStorage.removeItem(key);
            });
            
            this.setDefaults();
            
            this.notifyChange('allCleared', {});
            console.log('所有课程表数据已清空');
            return true;
        } catch (error) {
            console.error('清空课程表数据失败:', error);
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
        let csv = '时间段,' + this.data.weekDays.join(',') + '\n';
        
        this.data.timeSlots.forEach((timeSlot, timeIndex) => {
            const row = [timeSlot.name || `时间段${timeIndex + 1}`];
            
            this.data.weekDays.forEach((day, dayIndex) => {
                const course = this.getCourse(timeIndex, dayIndex);
                if (course) {
                    const courseText = [course.subject, course.teacher, course.classroom]
                        .filter(Boolean)
                        .join(' - ');
                    row.push(courseText);
                } else {
                    row.push('');
                }
            });
            
            csv += row.join(',') + '\n';
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
            if (importData.scheduleData) {
                this.setScheduleData(importData.scheduleData);
            }
            
            if (importData.timeSlots) {
                this.setTimeSlots(importData.timeSlots);
            }
            
            if (importData.weekDays) {
                this.setWeekDays(importData.weekDays);
            }
            
            this.notifyChange('dataImported', importData);
            console.log('课程表数据导入成功');
            return true;
        } catch (error) {
            console.error('导入课程表数据失败:', error);
            return false;
        }
    }
    
    /**
     * 数据变更通知
     * @param {string} action - 操作类型
     * @param {*} data - 相关数据
     */
    notifyChange(action, data) {
        const event = new CustomEvent('scheduleCache:change', {
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
        window.addEventListener('scheduleCache:change', callback);
    }
    
    /**
     * 移除数据变更监听
     * @param {Function} callback - 回调函数
     */
    offChange(callback) {
        window.removeEventListener('scheduleCache:change', callback);
    }
}

// 创建全局实例
const scheduleCache = new ScheduleCache();

// 兼容旧代码的全局函数
function getScheduleData() {
    return scheduleCache.getScheduleData();
}

function setScheduleData(data) {
    return scheduleCache.setScheduleData(data);
}

function saveScheduleData() {
    return scheduleCache.save();
}

function loadScheduleData() {
    return scheduleCache.getScheduleData();
}

function getCurrentCourse() {
    return scheduleCache.getCurrentCourse();
}

// 全局暴露
if (typeof window !== 'undefined') {
    window.ScheduleCache = ScheduleCache;
    window.scheduleCache = scheduleCache;
}

console.log('课程表缓存模块已加载');

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ScheduleCache, scheduleCache };
}