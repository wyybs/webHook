// webhook.js
const log = require('../../utils/winston')
const child_process = require('child_process')
const path = require('path')
const createHandler = require('gitee-webhook-handler')

const baserDir = path.join(__dirname, '/')
// console.log(baserDir)

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

// 接收所有事件(包括push事件)打印日志
handler.on('*', e => {

  const gitUrl = e.payload.repository.git_http_url
  const projectName = e.payload.repository.name
  const branchName = e.payload.ref.split('/')[2]

  log.info('webhook_event===>', e.event)
  log.info(`git地址==》${gitUrl} ，项目名称 ==> ${projectName}，分支 ==> ${branchName}`)

  // 监听push事件
  if (e.event === 'Push Hook') {
    log.info('监听到push事件')

    // 执行shell脚本
    run_cmd('sh',
      [`${baserDir}/serverHooks.sh`, gitUrl, projectName, branchName],
      function(text) {
        log.info(`sh脚本执行完成`, text)
      }
    );
  }
})


//监听发生错误
handler.on('error', err => {
  console.error('Error', err.message)
})

module.exports = handler

