// 中间件 - 包含next参数
// 中间件必须挂载在路由之前
const send = ((req, res, next) => {
    // status 默认值为 1，表示失败的情况
    // err 的值，可能是一个错误对象，也可能是一个错误的描述字符串
    res.cc = function (err, status = 1) {
      res.send({
        status,
        message: err instanceof Error ? err.message : err,
      })
    }
    next() // 将流转关系转交给下一个中间件或者路由
  })

  module.exports = send;
