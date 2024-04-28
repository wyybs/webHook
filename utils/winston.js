const path = require("path");
const winston = require("winston");
require("winston-daily-rotate-file");   // 根据时间分割日志"

const { format, transports } = winston;

const infoLogPath = path.join(__dirname, '../logs/baseLog/log-%DATE%.log');
const errorLogPath = path.join(__dirname, '../logs/errLog/log-%DATE%.log');
const exceptionsLogPath = path.join(__dirname, '../logs/exceptionsLog/log-%DATE%.log');

// const levels = {
//   error: 0,
//   warn: 1,
//   info: 2,
//   http: 3,
//   verbose: 4,
//   debug: 5,
//   silly: 6,
// };

const customFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss,SSS' }), // 添加了一个时间戳到日志消息中
  format.align(), // 日志消息对齐
  format.printf((info) => {
    const { timestamp, level, message, file, line, traceId } = info;
    // return `[${timestamp}] [${level}] -- [${traceId}] ${file}:${line} ${message}`; // 包括文件名和行号
    return `[${timestamp}] [${level}] -- [${traceId}] ${message}`;
  })
  // format.json() // 使用JSON格式化
);

const defaultOptions = {
  format: customFormat,
  datePattern: "YYYY-MM-DD",
  zippedArchive: true, // 是否通过压缩的方式归档被轮换的日志文件。
  maxSize: "20m", // 设置日志文件的最大大小，m 表示 mb 。
  maxFiles: "14d", // 保留日志文件的最大天数，此处表示自动删除超过 14 天的日志文件。
};


// 用于控制台打印的日志格式
const consoleTransport = new transports.Console({
  level: 'debug', // 控制台打印的日志级别
  format: format.combine(
    format.colorize(), // 用于给日志消息添加颜色
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss,SSS' }), // 添加了一个时间戳到日志消息中
    format.align(), // 日志消息对齐
    format.printf((info) => {
      const { timestamp, level, message, file, line, traceId } = info;
      return `[${timestamp}] [${level}] -- [${traceId}] ${message}`;
    })
  )
});

// 用于记录 info 和 debug 级别日志的文件传输器，按照日期生成文件
const infoAndDebugTransport = new transports.DailyRotateFile({
  level: 'debug',
  filename: infoLogPath,
  ...defaultOptions,
});


// 创建一个用于存放 error 级别日志的文件传输器，按照日期生成文件
const errorTransport = new transports.DailyRotateFile({
  level: 'error',
  filename: errorLogPath,
  ...defaultOptions,
});


const winstonLogger = winston.createLogger({
  format: format.simple(),
  exitOnError: false, //日志处理中抛出异常是否及时退出  
  exceptionHandlers: [ // 程序异常日志
    new transports.DailyRotateFile({
      filename: exceptionsLogPath,
    }),
  ],
  transports: [
    consoleTransport,
    infoAndDebugTransport,
    errorTransport,
  ]
});

const getMsg = (arg) => {
  if (typeof msg === 'object') return JSON.stringify(msg)
  const message = arg.map(item => {
    if (typeof item === 'object') return JSON.stringify(item)
    return item
  })
  return {
    message
  }
}

module.exports = class Logger {
  static error(...arg) {
    winstonLogger.error(getMsg(arg))
  }

  static info(...arg) {
    winstonLogger.info(getMsg(arg))
  }

  static warn(...arg) {
    winstonLogger.warn(getMsg(arg))
  }

  static debug(...arg) {
    winstonLogger.debug(getMsg(arg))
  }
}


/*  
* 创建一个包装函数，用于记录带有文件名和行号的日志
* 函数中使用了 errorTemp.stack 属性来获取堆栈跟踪信息，这可能会引入一些额外的内存消耗，因为堆栈跟踪信息通常比较长。
* 如果堆栈跟踪信息非常大，那么拆分和匹配操作可能会占用一些额外的内存。

function getLogLocation(args) {
  const errorTemp = new Error();
  const stack = errorTemp.stack.split('\n')[3]; // 获取堆栈跟踪的第三行  at Object.<anonymous> (F:\study\test\webHook\main.js:8:5)
  const matches = /at\s+(.*):(\d+):(\d+)/.exec(stack); // 解析文件路径、行号和列号
  const file = path.basename(matches[1]); // 提取文件名部分
  const line = matches[2];

  // Use the captured file name, line number, and the concatenated message to log
  return {
    message: args,
    file,
    line,
  };
}

// 创建自定义logger对象
const log = {
  debug: (...args) => {
    // winstonLogger.debug(getLogWithFileInfo(args))
    winstonLogger.debug(getLogLocation(args))
  },
  info: (...args) => {
    winstonLogger.info(getLogLocation(args))
  },
  error: (...args) => {
    errorWinstonLogger.error(getLogLocation(args))
  },
};

*/



