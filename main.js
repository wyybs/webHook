// webhook.js
const log = require('./utils/winston.js')
const http = require('http')

const cicdTestHandler = require('./webHooks/cicd_test/serverHooks.js')


// 处理 404 错误
const baseFun = (req, res, err) => {
  res.statusCode = 404
  res.end('没找到对应位置===')
}

//创建一个 HTTP 代理服务器
http.createServer((req, res) => {
  cicdTestHandler(req, res, err => {
    res.statusCode = 404
    res.end('没找到对应位置===')
  })
}).listen(9000, () => {
  log.info('9000 端口已启动')
})


