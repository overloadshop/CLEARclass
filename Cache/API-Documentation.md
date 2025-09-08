# 班级管理系统缓存API文档

## 概述

班级管理系统缓存模块提供了统一的数据管理接口，包含学生名单、值日数据、班级信息等核心数据的缓存管理。所有缓存模块都支持自动保存、事件通知和数据同步功能。

## 缓存模块架构

```
Cache/
├── StudentListCache.js     # 学生名单缓存
├── DutyDataCache.js        # 值日数据缓存
├── ClassInfoCache.js       # 班级信息缓存
├── DataCache.js            # 通用数据缓存
├── README.md               # 使用说明
└── API-Documentation.md    # API文档
```

## 1. StudentListCache - 学生名单缓存

### 基本用法

```javascript
// 引入缓存模块
<script src="../Cache/StudentListCache.js"></script>

// 使用全局实例
const students = studentListCache.getAll();
```

### 核心API

#### 学生管理

```javascript
// 获取所有学生
const students = studentListCache.getAll();
// 返回: ['张三', '李四', '王五']

// 获取学生数量
const count = studentListCache.getCount();
// 返回: 45

// 添加学生
const success = studentListCache.add('新学生');
// 返回: true/false

// 删除学生
const success = studentListCache.remove('张三');
// 返回: true/false

// 检查学生是否存在
const exists = studentListCache.exists('李四');
// 返回: true/false

// 设置完整学生名单
const success = studentListCache.setAll(['张三', '李四', '王五']);
// 返回: true/false

// 清空所有学生
const success = studentListCache.clear();
// 返回: true/false
```

#### 批量操作

```javascript
// 批量添加学生
const result = studentListCache.addBatch(['新生1', '新生2', '新生3']);
// 返回: { success: 2, failed: 0, duplicates: 1 }
```

#### 搜索和随机

```javascript
// 搜索学生
const results = studentListCache.search('张');
// 返回: ['张三', '张小明']

// 随机获取学生
const randomStudents = studentListCache.getRandom(3);
// 返回: ['李四', '王五', '赵六']
```

#### 数据导入导出

```javascript
// 导出学生名单
const jsonData = studentListCache.export('json');
const csvData = studentListCache.export('csv');
const txtData = studentListCache.export('txt');

// 导入学生名单
const result = studentListCache.import(data, 'json');
// 返回: { success: 10, failed: 0, duplicates: 2 }
```

#### 事件监听

```javascript
// 监听数据变更
studentListCache.onChange((event) => {
    console.log('操作类型:', event.detail.action);
    console.log('相关数据:', event.detail.data);
    console.log('当前总数:', event.detail.count);
    console.log('时间戳:', event.detail.timestamp);
});

// 移除监听
studentListCache.offChange(callback);
```

### 兼容性函数

```javascript
// 兼容旧代码的全局函数
const students = getStudentList();
setStudentList(['张三', '李四']);
addStudent('新学生');
removeStudent('张三');
```

## 2. DutyDataCache - 值日数据缓存

### 基本用法

```javascript
// 引入缓存模块
<script src="../Cache/DutyDataCache.js"></script>

// 使用全局实例
const dutyData = dutyDataCache.getDutyData();
```

### 核心API

#### 值日分配管理

```javascript
// 获取所有值日分配数据
const dutyData = dutyDataCache.getDutyData();
// 返回: { '0-1': { item: '扫地', person: '张三', position: '组长', time: '08:00-08:30' } }

// 设置值日分配数据
const success = dutyDataCache.setDutyData(newDutyData);
// 返回: true/false

// 添加或更新单个值日分配
const assignment = {
    item: '扫地',
    person: '张三',
    position: '组长',
    time: '08:00-08:30'
};
const success = dutyDataCache.setDutyAssignment('0-1', assignment);
// 返回: true/false

// 删除值日分配
const success = dutyDataCache.removeDutyAssignment('0-1');
// 返回: true/false

// 清空所有值日分配
const success = dutyDataCache.clearDutyData();
// 返回: true/false
```

#### 时间段管理

```javascript
// 获取活跃时间段
const timeSlots = dutyDataCache.getTimeSlots();
// 返回: [{ name: '早读', start: '08:00', end: '08:30' }]

// 设置活跃时间段
const success = dutyDataCache.setTimeSlots(newTimeSlots);
// 返回: true/false

// 获取候选时间段
const availableSlots = dutyDataCache.getAvailableTimeSlots();
// 返回: [{ name: '午休', start: '12:00', end: '13:00' }]

// 设置候选时间段
const success = dutyDataCache.setAvailableTimeSlots(slots);
// 返回: true/false

// 添加候选时间段
const timeSlot = { name: '晚自习', start: '19:00', end: '21:00' };
const success = dutyDataCache.addAvailableTimeSlot(timeSlot);
// 返回: true/false
```

#### 值日项目管理

```javascript
// 获取候选值日项目
const items = dutyDataCache.getAvailableDutyItems();
// 返回: ['扫地', '擦黑板', '倒垃圾']

// 设置候选值日项目
const success = dutyDataCache.setAvailableDutyItems(['扫地', '擦黑板']);
// 返回: true/false

// 添加候选值日项目
const success = dutyDataCache.addAvailableDutyItem('整理讲台');
// 返回: true/false

// 删除候选值日项目
const success = dutyDataCache.removeAvailableDutyItem('扫地');
// 返回: true/false
```

#### 值日职位管理

```javascript
// 获取值日职位
const positions = dutyDataCache.getDutyPositions();
// 返回: [{ name: '组长', time: '全天', description: '负责协调' }]

// 设置值日职位
const success = dutyDataCache.setDutyPositions(newPositions);
// 返回: true/false
```

#### 数据导入导出

```javascript
// 导出所有值日数据
const jsonData = dutyDataCache.export('json');

// 导入值日数据
const success = dutyDataCache.import(data, 'json');
// 返回: true/false

// 清空所有数据
const success = dutyDataCache.clearAll();
// 返回: true/false
```

### 兼容性函数

```javascript
// 兼容旧代码的全局函数
const dutyData = getDutyData();
setDutyData(newData);
saveDutyData();
```

## 3. ClassInfoCache - 班级信息缓存

### 基本用法

```javascript
// 引入缓存模块
<script src="../Cache/ClassInfoCache.js"></script>

// 使用全局实例
const classInfo = classInfoCache.getClassInfo();
```

### 核心API

#### 班级信息管理

```javascript
// 获取班级信息
const classInfo = classInfoCache.getClassInfo();
// 返回: { className: '高一(1)班', grade: '高一', totalStudents: 45, ... }

// 设置班级信息
const newInfo = {
    className: '高一(1)班',
    grade: '高一',
    totalStudents: 45,
    maleStudents: 23,
    femaleStudents: 22,
    classTeacher: '张老师',
    classSlogan: '团结奋进，追求卓越'
};
const success = classInfoCache.setClassInfo(newInfo);
// 返回: true/false

// 更新特定字段
const success = classInfoCache.updateClassInfoField('className', '高一(2)班');
// 返回: true/false

// 便捷方法
const className = classInfoCache.getClassName();
const success = classInfoCache.setClassName('高一(1)班');
const totalStudents = classInfoCache.getTotalStudents();
const success = classInfoCache.setTotalStudents(45);
```

#### 系统设置管理

```javascript
// 获取系统设置
const settings = classInfoCache.getSystemSettings();
// 返回: { theme: 'light', autoSave: true, notifications: true }

// 设置系统设置
const newSettings = {
    theme: 'dark',
    autoSave: true,
    notifications: false
};
const success = classInfoCache.setSystemSettings(newSettings);
// 返回: true/false

// 更新特定设置
const success = classInfoCache.updateSystemSettingsField('theme', 'dark');
// 返回: true/false

// 便捷方法
const theme = classInfoCache.getTheme();
const success = classInfoCache.setTheme('dark');
```

#### 班级徽章管理

```javascript
// 获取班级徽章
const emblem = classInfoCache.getClassEmblem();
// 返回: 'data:image/svg+xml;base64,...' 或 SVG字符串

// 设置班级徽章
const success = classInfoCache.setClassEmblem(svgData);
// 返回: true/false

// 清除班级徽章
const success = classInfoCache.clearClassEmblem();
// 返回: true/false

// 获取默认徽章配置
const config = classInfoCache.getDefaultBadgeConfig();
// 返回: { color: '#007aff', shape: 'circle', ... } 或 null

// 设置默认徽章配置
const config = { color: '#007aff', shape: 'circle' };
const success = classInfoCache.setDefaultBadgeConfig(config);
// 返回: true/false
```

#### 数据导入导出

```javascript
// 导出所有班级信息
const jsonData = classInfoCache.export('json');

// 导入班级信息
const success = classInfoCache.import(data, 'json');
// 返回: true/false

// 清空所有数据
const success = classInfoCache.clearAll();
// 返回: true/false
```

### 兼容性函数

```javascript
// 兼容旧代码的全局函数
const classInfo = getClassInfo();
setClassInfo(newInfo);
const settings = getSystemSettings();
setSystemSettings(newSettings);
```

## 4. 通用缓存功能

### 缓存信息查询

```javascript
// 获取缓存信息
const info = studentListCache.getCacheInfo();
// 返回: { count: 45, lastModified: 1234567890, autoSave: true, students: [...] }

const info = dutyDataCache.getCacheInfo();
// 返回: { lastModified: 1234567890, autoSave: true, data: { dutyDataCount: 10, ... } }

const info = classInfoCache.getCacheInfo();
// 返回: { lastModified: 1234567890, autoSave: true, data: { classInfo: {...}, ... } }
```

### 事件系统

所有缓存模块都支持统一的事件系统：

```javascript
// 事件类型
// StudentListCache: 'studentListCache:change'
// DutyDataCache: 'dutyDataCache:change'
// ClassInfoCache: 'classInfoCache:change'

// 监听事件
cacheInstance.onChange((event) => {
    const { action, data, timestamp } = event.detail;
    console.log(`操作: ${action}, 数据:`, data, `时间: ${timestamp}`);
});

// 移除监听
cacheInstance.offChange(callback);

// 手动触发事件（内部使用）
cacheInstance.notifyChange('customAction', customData);
```

### 常见事件类型

#### StudentListCache事件
- `loaded` - 数据加载完成
- `saved` - 数据保存完成
- `added` - 添加学生
- `removed` - 删除学生
- `batchAdded` - 批量添加学生
- `cleared` - 清空学生名单
- `setAll` - 设置完整名单

#### DutyDataCache事件
- `loaded` - 数据加载完成
- `saved` - 数据保存完成
- `dutyDataChanged` - 值日分配数据变更
- `assignmentChanged` - 单个分配变更
- `assignmentRemoved` - 删除分配
- `dutyDataCleared` - 清空值日数据
- `timeSlotsChanged` - 时间段变更
- `availableDutyItemsChanged` - 候选项目变更

#### ClassInfoCache事件
- `loaded` - 数据加载完成
- `saved` - 数据保存完成
- `classInfoChanged` - 班级信息变更
- `classInfoFieldChanged` - 班级信息字段变更
- `systemSettingsChanged` - 系统设置变更
- `systemSettingsFieldChanged` - 系统设置字段变更
- `classEmblemChanged` - 班级徽章变更
- `classEmblemCleared` - 清除班级徽章

## 5. 最佳实践

### 页面集成

```html
<!-- 引入所需的缓存模块 -->
<script src="../Cache/StudentListCache.js"></script>
<script src="../Cache/DutyDataCache.js"></script>
<script src="../Cache/ClassInfoCache.js"></script>

<script>
// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    // 缓存系统自动加载数据
    console.log('学生数量:', studentListCache.getCount());
    
    // 监听数据变更
    studentListCache.onChange(handleStudentChange);
    dutyDataCache.onChange(handleDutyChange);
    classInfoCache.onChange(handleClassInfoChange);
});

// 数据变更处理
function handleStudentChange(event) {
    console.log('学生名单变更:', event.detail);
    updateStudentUI();
}

function handleDutyChange(event) {
    console.log('值日数据变更:', event.detail);
    updateDutyUI();
}

function handleClassInfoChange(event) {
    console.log('班级信息变更:', event.detail);
    updateClassInfoUI();
}
</script>
```

### 错误处理

```javascript
// 所有缓存操作都有返回值，建议检查操作结果
if (studentListCache.add('新学生')) {
    console.log('添加成功');
    updateUI();
} else {
    console.log('添加失败，可能是重复学生');
    showErrorMessage('学生已存在');
}

// 批量操作返回详细结果
const result = studentListCache.addBatch(newStudents);
if (result.success > 0) {
    console.log(`成功添加 ${result.success} 名学生`);
    if (result.duplicates > 0) {
        console.log(`${result.duplicates} 名学生已存在`);
    }
}
```

### 性能优化

```javascript
// 批量操作时临时关闭自动保存
studentListCache.autoSave = false;
for (let i = 0; i < 1000; i++) {
    studentListCache.add(`学生${i}`);
}
studentListCache.autoSave = true;
studentListCache.save(); // 手动保存一次

// 或者使用批量操作API
const students = Array.from({length: 1000}, (_, i) => `学生${i}`);
studentListCache.addBatch(students);
```

### 数据同步

```javascript
// 跨页面数据同步示例
// 页面A：修改学生名单
studentListCache.add('新学生');

// 页面B：自动接收变更通知
studentListCache.onChange((event) => {
    if (event.detail.action === 'added') {
        console.log('其他页面添加了学生:', event.detail.data);
        refreshStudentList();
    }
});
```

## 6. 故障排除

### 常见问题

1. **数据不同步**
   - 确保所有页面都引入了相同的缓存模块
   - 检查事件监听是否正确设置
   - 确认localStorage没有被其他代码直接修改

2. **性能问题**
   - 避免频繁的单个操作，使用批量操作API
   - 在大量数据操作时临时关闭自动保存
   - 检查事件监听器是否过多或处理逻辑过重

3. **数据丢失**
   - 检查localStorage容量限制（通常5-10MB）
   - 确认浏览器支持localStorage
   - 检查是否有异常导致数据保存失败

### 调试工具

```javascript
// 查看所有缓存信息
console.log('学生缓存:', studentListCache.getCacheInfo());
console.log('值日缓存:', dutyDataCache.getCacheInfo());
console.log('班级缓存:', classInfoCache.getCacheInfo());

// 查看localStorage使用情况
function getLocalStorageSize() {
    let total = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += localStorage[key].length + key.length;
        }
    }
    return total;
}
console.log('localStorage使用:', getLocalStorageSize(), '字符');

// 导出所有数据进行备份
const backup = {
    students: studentListCache.export('json'),
    duty: dutyDataCache.export('json'),
    classInfo: classInfoCache.export('json'),
    timestamp: new Date().toISOString()
};
console.log('数据备份:', backup);
```

## 7. 版本信息

- **当前版本**: 1.0.0
- **兼容性**: 支持所有现代浏览器
- **依赖**: 无外部依赖，纯JavaScript实现
- **大小**: 约50KB（所有模块）

## 8. 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 实现StudentListCache、DutyDataCache、ClassInfoCache
- 支持自动保存、事件通知、数据同步
- 提供完整的API和兼容性函数

---

**注意**: 本文档描述的是班级管理系统缓存模块的完整API。在实际使用中，请根据具体需求选择合适的功能和方法。如有问题，请参考源代码中的注释或联系开发团队。