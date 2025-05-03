# MySQL 数据库模型说明

## 数据库迁移说明

本项目已从 MongoDB 迁移到 MySQL 数据库，使用 Sequelize ORM 进行数据库操作。

## 模型变更

### Trip 模型

游记模型已从 MongoDB 格式转换为 MySQL 格式，保留了所有原有字段：
- `id`: 主键，自增
- `title`: 游记标题
- `content`: 游记内容
- `createTime`: 创建时间
- `updateTime`: 更新时间
- `userId`: 用户ID
- `images`: 图片列表（以JSON字符串形式存储）
- `auditStatus`: 审核状态
- `auditTime`: 审核时间
- `auditor`: 审核人
- `deleteReason`: 删除原因
- `isDeleted`: 逻辑删除标识
- `rejectReason`: 拒绝原因

### User 模型

用户模型已从验证规则转换为完整的 Sequelize 模型，包含以下字段：
- `id`: 主键，自增
- `username`: 用户名
- `password`: 密码
- `nickname`: 昵称
- `email`: 邮箱
- `avatar`: 头像
- `createTime`: 创建时间
- `updateTime`: 更新时间
- `status`: 用户状态

## 使用方法

### 初始化数据库

在应用启动时，需要调用模型初始化函数来同步数据库表结构：

```javascript
const { syncModels } = require('./models/index');

// 在应用启动时同步数据库表
syncModels().then(() => {
  console.log('数据库表已同步');
});
```

### 使用模型

```javascript
const { Trip, User } = require('./models/index');

// 创建新游记
async function createTrip(tripData) {
  const newTrip = await Trip.create(tripData);
  return newTrip;
}

// 查询游记
async function findTrips() {
  const trips = await Trip.findAll({
    where: { auditStatus: 'pass', isDeleted: false },
    order: [['createTime', 'DESC']],
    include: [{ model: User, attributes: ['username', 'avatar'] }]
  });
  return trips;
}
```

## 注意事项

1. 图片列表字段 `images` 在数据库中以 JSON 字符串形式存储，但在模型中会自动转换为数组
2. 原有的 MongoDB 查询需要修改为 Sequelize 查询格式
3. 关联查询使用 Sequelize 的 `include` 选项替代 MongoDB 的聚合管道
4. 用户验证规则保持不变，仍然使用 @hapi/joi 进行验证