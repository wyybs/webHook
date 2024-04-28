// webhook.js
const log = require('../utils/winston')
const path = require('path')
const http = require('http')
const child_process = require('child_process')
const createHandler = require('gitee-webhook-handler')

//path： 地址后面路径 http://127.0.0.1:9000/webhooks   secret:填写 gitee || github 配置的webHook密码
const handler = createHandler({
  path: '/webhooks',
  secret: '123456' // 之间设置的秘钥
})

//引入 child_process  创建一个子进程 函数
function run_cmd(cmd, args, callback) {
  const spawn = child_process.spawn;
  const child = spawn(cmd, args);
  let resp = "";

  child.stdout.on('data', function(buffer) {
    resp += buffer.toString();
  });

  child.stdout.on('end', function() {
    callback(resp)
  });

}

//创建一个 HTTP 代理服务器
http.createServer((req, res) => {
  console.log('req==>', req.url)
  handler(req, res, err => {
    res.statusCode = 404
    res.end('no such location===')
  })
}).listen(9000, () => {
  log.info('Webhook listen at 9000')
})


// 接收所有事件(包括push事件)打印日志
handler.on('*', e => {
  log.info('event===>', e.event)
  log.info(`项目 ==> ${e.payload.repository.name}  分支 ==> ${e.payload.ref}`)

  run_cmd('sh',
    ['./serverHooks.sh', e.payload.repository.name],
    function(text) {
      log.info(`${e.payload.repository.name}==>部署完成`, text)
    }
  );

})

//监听push钩子 时触发函数
// handler.on('Push Hook', function(event) {
//   // log.info('push==>', event)

//   // 执行 sh 文件
//   log.info('执行server脚本中----')

//   run_cmd('sh',
//     ['./serverHooks.sh', event.payload.repository.name],
//     function(text) {
//       log.info('------走了', text)
//     }
//   );

//   log.info(`Received a push event for ==> ${event.payload.repository.name} to ==> ${event.payload.ref}`)
// })

//监听发生错误
handler.on('error', err => {
  console.error('Error', err.message)
})


