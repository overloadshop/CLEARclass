# 数据缓存系统使用说明

## 概述

数据缓存系统提供了统一的数据管理接口，用于处理班级管理系统中的各种数据缓存，包括学生名单、课程表、值日数据等。

## 文件结构

```
Cache/
├── DataCache.js     # 核心缓存管理模块
└── README.md        # 使用说明文档
```

## 快速开始

### 1. 引入缓存模块

在HTML页面中引入缓存模块：

```html
<script src="../Cache/DataCache.js"></script>
```

### 2. 基本使用

```javascript
// 获取学生名单
const students = dataCache.getStudentList();

// 添加学生
dataCache.addStudent('张三');

// 设置班级信息
dataCache.setClassInfo({
    className: '高一(1)班',
    totalStudents: 45,
    maleStudents: 23,
    femaleStudents: 22
});

// 获取值日数据
const dutyData = dataCache.getDutyData();
```

## API 参考

### 核心方法

#### `get(key, defaultValue)`
获取缓存数据
- `key`: 缓存键名
- `defaultValue`: 默认值（可选）
- 返回: 缓存的数据

#### `set(key, value)`
设置缓存数据
- `key`: 缓存键名
- `value`: 要缓存的数据
- 返回: 是否设置成功

#### `remove(key)`
删除缓存数据
- `key`: 缓存键名
- 返回: 是否删除成功

#### `clear()`
清空所有缓存数据
- 返回: 是否清空成功

### 便捷方法

#### 学生名单相关
- `getStudentList()`: 获取学生名单
- `setStudentList(students)`: 设置学生名单
- `addStudent(studentName)`: 添加学生
- `removeStudent(studentName)`: 删除学生

#### 班级信息相关
- `getClassInfo()`: 获取班级信息
- `setClassInfo(classInfo)`: 设置班级信息

#### 值日数据相关
- `getDutyData()`: 获取值日数据
- `setDutyData(dutyData)`: 设置值日数据

#### 时间段数据相关
- `getTimeSlots()`: 获取时间段数据
- `setTimeSlots(timeSlots)`: 设置时间段数据

### 数据监听

```javascript
// 监听数据变更
dataCache.onDataChange((event) => {
    console.log('数据变更:', event.detail);
    // { key: 'studentList', value: [...], timestamp: 1234567890 }
});
```

## 缓存键名常量

```javascript
const cacheKeys = {
    STUDENT_LIST: 'studentList',           // 学生名单
    CLASS_INFO: 'classInfo',               // 班级信息
    SCHEDULE_DATA: 'scheduleData',         // 课程表数据
    TIME_SLOTS: 'timeSlots',               // 时间段
    DUTY_DATA: 'dutyData',                 // 值日数据
    DUTY_ITEMS: 'dutyItems',               // 值日项目
    AVAILABLE_DUTY_ITEMS: 'availableDutyItems',     // 候选值日项目
    AVAILABLE_TIME_SLOTS: 'availableTimeSlots',     // 候选时间段
    DUTY_POSITIONS: 'dutyPositions'        // 值日职位
};
```

## 使用示例

### 在人员配置页面中使用

```javascript
// Staffing.html
function addStudent() {
    const name = document.getElementById('studentName').value.trim();
    if (name && dataCache.addStudent(name)) {
        updateStudentList();
        toast.success('学生添加成功');
    } else {
        toast.error('学生已存在或添加失败');
    }
}

function loadStudentList() {
    const students = dataCache.getStudentList();
    // 渲染学生列表
    renderStudentList(students);
}
```

### 在随机点名页面中使用

```javascript
// RandomPicker.html
function loadStudents() {
    const students = dataCache.getStudentList();
    if (students.length === 0) {
        toast.error('请先在人员配置中添加学生名单');
        return;
    }
    // 使用学生数据进行随机抽取
    performRandomPick(students);
}
```

### 在值日表页面中使用

```javascript
// ZhiRiTable.html
function loadDutyData() {
    const dutyData = dataCache.getDutyData();
    const students = dataCache.getStudentList();
    // 渲染值日表
    renderDutyTable(dutyData, students);
}

function saveDutyAssignment(assignment) {
    const dutyData = dataCache.getDutyData();
    dutyData[assignment.key] = assignment.data;
    dataCache.setDutyData(dutyData);
}
```

## 数据同步

缓存系统支持跨页面数据同步，当一个页面修改数据时，其他页面可以通过监听事件获得通知：

```javascript
// 监听学生名单变更
dataCache.onDataChange((event) => {
    if (event.detail.key === 'studentList') {
        // 重新加载学生列表
        loadStudentList();
    }
});
```

## 调试和监控

```javascript
// 获取所有缓存信息
const cacheInfo = dataCache.getCacheInfo();
console.log('缓存信息:', cacheInfo);

// 检查特定缓存是否存在
if (dataCache.exists('studentList')) {
    console.log('学生名单缓存存在');
}

// 获取缓存大小
const size = dataCache.getSize('studentList');
console.log('学生名单缓存大小:', size, '字节');
```

## 迁移指南

### 从直接使用 localStorage 迁移

**旧代码:**
```javascript
// 旧方式
const students = JSON.parse(localStorage.getItem('studentList') || '[]');
localStorage.setItem('studentList', JSON.stringify(students));
```

**新代码:**
```javascript
// 新方式
const students = dataCache.getStudentList();
dataCache.setStudentList(students);
```

### 优势

1. **统一接口**: 所有数据操作通过统一的API
2. **错误处理**: 内置异常处理和默认值
3. **类型安全**: 自动JSON序列化/反序列化
4. **事件通知**: 支持数据变更监听
5. **调试友好**: 提供缓存信息查看功能
6. **向后兼容**: 保持与现有代码的兼容性

## 注意事项

1. 确保在使用前引入 `DataCache.js` 文件
2. 大量数据操作时注意localStorage的存储限制（通常5-10MB）
3. 敏感数据不建议存储在localStorage中
4. 定期清理不需要的缓存数据以节省空间

## 版本历史

- v1.0.0: 初始版本，提供基础缓存功能
- 支持学生名单、班级信息、值日数据等核心数据缓存
- 提供事件监听和数据同步功能