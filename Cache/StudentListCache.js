/**
 * 学生名单缓存管理模块
 * 专门处理学生名单的缓存操作
 */

class StudentListCache {
    constructor() {
        this.cacheKey = 'studentList';
        this.cacheFile = 'Cache/studentList.json';
        this.students = [];
        this.lastModified = null;
        this.autoSave = true;
        
        // 初始化时加载数据
        this.load();
    }
    
    /**
     * 从localStorage和缓存文件加载学生数据
     */
    load() {
        try {
            // 优先从localStorage读取
            const localData = localStorage.getItem(this.cacheKey);
            if (localData) {
                this.students = JSON.parse(localData);
                this.lastModified = Date.now();
                console.log('从localStorage加载学生名单:', this.students.length, '人');
            } else {
                this.students = [];
                console.log('未找到学生名单缓存，初始化为空');
            }
        } catch (error) {
            console.error('加载学生名单失败:', error);
            this.students = [];
        }
        
        // 触发加载完成事件
        this.notifyChange('loaded', this.students);
    }
    
    /**
     * 保存学生数据到localStorage和缓存文件
     */
    save() {
        try {
            // 保存到localStorage
            localStorage.setItem(this.cacheKey, JSON.stringify(this.students));
            this.lastModified = Date.now();
            
            // 生成缓存文件内容
            const cacheData = {
                students: this.students,
                lastModified: this.lastModified,
                version: '1.0.0',
                metadata: {
                    totalCount: this.students.length,
                    createdAt: new Date().toISOString(),
                    source: 'StudentListCache'
                }
            };
            
            // 触发保存事件
            this.notifyChange('saved', this.students);
            
            console.log('学生名单已保存:', this.students.length, '人');
            return true;
        } catch (error) {
            console.error('保存学生名单失败:', error);
            return false;
        }
    }
    
    /**
     * 获取所有学生
     * @returns {Array} 学生名单数组
     */
    getAll() {
        return [...this.students];
    }
    
    /**
     * 获取学生数量
     * @returns {number} 学生数量
     */
    getCount() {
        return this.students.length;
    }
    
    /**
     * 添加学生
     * @param {string} studentName - 学生姓名
     * @returns {boolean} 是否添加成功
     */
    add(studentName) {
        if (!studentName || typeof studentName !== 'string') {
            console.warn('学生姓名无效:', studentName);
            return false;
        }
        
        const name = studentName.trim();
        if (!name) {
            console.warn('学生姓名不能为空');
            return false;
        }
        
        if (this.exists(name)) {
            console.warn('学生已存在:', name);
            return false;
        }
        
        this.students.push(name);
        
        if (this.autoSave) {
            this.save();
        }
        
        this.notifyChange('added', name);
        console.log('添加学生:', name);
        return true;
    }
    
    /**
     * 删除学生
     * @param {string} studentName - 学生姓名
     * @returns {boolean} 是否删除成功
     */
    remove(studentName) {
        const index = this.students.indexOf(studentName);
        if (index === -1) {
            console.warn('学生不存在:', studentName);
            return false;
        }
        
        this.students.splice(index, 1);
        
        if (this.autoSave) {
            this.save();
        }
        
        this.notifyChange('removed', studentName);
        console.log('删除学生:', studentName);
        return true;
    }
    
    /**
     * 检查学生是否存在
     * @param {string} studentName - 学生姓名
     * @returns {boolean} 是否存在
     */
    exists(studentName) {
        return this.students.includes(studentName);
    }
    
    /**
     * 批量添加学生
     * @param {Array} studentNames - 学生姓名数组
     * @returns {Object} 添加结果统计
     */
    addBatch(studentNames) {
        if (!Array.isArray(studentNames)) {
            console.warn('批量添加参数必须是数组');
            return { success: 0, failed: 0, duplicates: 0 };
        }
        
        let success = 0;
        let failed = 0;
        let duplicates = 0;
        
        // 临时关闭自动保存
        const originalAutoSave = this.autoSave;
        this.autoSave = false;
        
        studentNames.forEach(name => {
            if (this.exists(name)) {
                duplicates++;
            } else if (this.add(name)) {
                success++;
            } else {
                failed++;
            }
        });
        
        // 恢复自动保存并保存一次
        this.autoSave = originalAutoSave;
        if (this.autoSave && success > 0) {
            this.save();
        }
        
        const result = { success, failed, duplicates };
        this.notifyChange('batchAdded', result);
        console.log('批量添加学生完成:', result);
        return result;
    }
    
    /**
     * 清空所有学生
     * @returns {boolean} 是否清空成功
     */
    clear() {
        const count = this.students.length;
        this.students = [];
        
        if (this.autoSave) {
            this.save();
        }
        
        this.notifyChange('cleared', count);
        console.log('清空学生名单，共删除:', count, '人');
        return true;
    }
    
    /**
     * 设置完整的学生名单
     * @param {Array} studentNames - 学生姓名数组
     * @returns {boolean} 是否设置成功
     */
    setAll(studentNames) {
        if (!Array.isArray(studentNames)) {
            console.warn('学生名单必须是数组');
            return false;
        }
        
        // 过滤重复和无效名称
        const validNames = [...new Set(studentNames.filter(name => 
            name && typeof name === 'string' && name.trim()
        ))].map(name => name.trim());
        
        this.students = validNames;
        
        if (this.autoSave) {
            this.save();
        }
        
        this.notifyChange('setAll', validNames);
        console.log('设置学生名单:', validNames.length, '人');
        return true;
    }
    
    /**
     * 搜索学生
     * @param {string} keyword - 搜索关键词
     * @returns {Array} 匹配的学生名单
     */
    search(keyword) {
        if (!keyword) {
            return this.getAll();
        }
        
        const lowerKeyword = keyword.toLowerCase();
        return this.students.filter(name => 
            name.toLowerCase().includes(lowerKeyword)
        );
    }
    
    /**
     * 随机获取学生
     * @param {number} count - 获取数量，默认1
     * @returns {Array} 随机选中的学生
     */
    getRandom(count = 1) {
        if (count <= 0 || this.students.length === 0) {
            return [];
        }
        
        if (count >= this.students.length) {
            return [...this.students];
        }
        
        const shuffled = [...this.students].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
    
    /**
     * 获取缓存信息
     * @returns {Object} 缓存信息
     */
    getCacheInfo() {
        return {
            count: this.students.length,
            lastModified: this.lastModified,
            cacheKey: this.cacheKey,
            autoSave: this.autoSave,
            students: this.getAll()
        };
    }
    
    /**
     * 导出学生名单
     * @param {string} format - 导出格式 ('json', 'csv', 'txt')
     * @returns {string} 导出的数据
     */
    export(format = 'json') {
        switch (format.toLowerCase()) {
            case 'json':
                return JSON.stringify({
                    students: this.students,
                    exportTime: new Date().toISOString(),
                    count: this.students.length
                }, null, 2);
            
            case 'csv':
                return '学生姓名\n' + this.students.join('\n');
            
            case 'txt':
                return this.students.join('\n');
            
            default:
                console.warn('不支持的导出格式:', format);
                return this.export('json');
        }
    }
    
    /**
     * 导入学生名单
     * @param {string} data - 导入的数据
     * @param {string} format - 数据格式
     * @returns {Object} 导入结果
     */
    import(data, format = 'json') {
        try {
            let students = [];
            
            switch (format.toLowerCase()) {
                case 'json':
                    const jsonData = JSON.parse(data);
                    students = Array.isArray(jsonData) ? jsonData : jsonData.students || [];
                    break;
                
                case 'csv':
                case 'txt':
                    students = data.split('\n')
                        .map(line => line.trim())
                        .filter(line => line && line !== '学生姓名');
                    break;
                
                default:
                    throw new Error('不支持的导入格式: ' + format);
            }
            
            const result = this.addBatch(students);
            console.log('导入学生名单完成:', result);
            return result;
        } catch (error) {
            console.error('导入学生名单失败:', error);
            return { success: 0, failed: 1, duplicates: 0, error: error.message };
        }
    }
    
    /**
     * 数据变更通知
     * @param {string} action - 操作类型
     * @param {*} data - 相关数据
     */
    notifyChange(action, data) {
        const event = new CustomEvent('studentListCache:change', {
            detail: {
                action,
                data,
                timestamp: Date.now(),
                count: this.students.length
            }
        });
        window.dispatchEvent(event);
    }
    
    /**
     * 监听数据变更
     * @param {Function} callback - 回调函数
     */
    onChange(callback) {
        window.addEventListener('studentListCache:change', callback);
    }
    
    /**
     * 移除数据变更监听
     * @param {Function} callback - 回调函数
     */
    offChange(callback) {
        window.removeEventListener('studentListCache:change', callback);
    }
}

// 创建全局实例
const studentListCache = new StudentListCache();

// 兼容旧代码的全局函数
function getStudentList() {
    return studentListCache.getAll();
}

function setStudentList(students) {
    return studentListCache.setAll(students);
}

function addStudent(name) {
    return studentListCache.add(name);
}

function removeStudent(name) {
    return studentListCache.remove(name);
}

// 全局暴露
if (typeof window !== 'undefined') {
    window.StudentListCache = StudentListCache;
    window.studentListCache = studentListCache;
}

console.log('学生名单缓存模块已加载');

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StudentListCache, studentListCache };
}