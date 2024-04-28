# ******* serverHooks.sh

#!/bin/bash

#  测试
# ====================================================================

echo "hello world"

# 定义变量
dir="F:\study\test\webHook"
subDir="$dir\cicd_test" # 项目目录
workDir="$dir\copy" # 工作目录
logDir="$dir\logs\cicd_test" # 日志目录
log_file="$logDir\cicd_test-$(date '+%Y-%m-%d').log" # 日志文件路径

gitUrl="https://gitee.com/wyybs/cicd_test.git" # git地址

# 判断日志目录是否存在
if [ ! -d "$logDir" ]; then
    mkdir "$logDir"
fi

# 添加时间戳函数
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') $1" >> "$log_file"
}

# 封装错误处理逻辑
handle_error() {
    log "$1"
    exit 1
}


log "***********开始部署***********"


# 判断是否有项目目录文件夹
if [ ! -d "$subDir" ]; then
    log "$subDir 不存在==》Git clone $gitUrl"
    # git clone $gitUrl && log "$? ==> clone的返回值" || handle_error "Git clone 失败"
    git clone $gitUrl || handle_error "Git clone 失败"
    cd $subDir && log "进入 ==》 目录 $subDir" || handle_error "$subDir 无法进入"
else
    cd "$subDir" && log "目录存在==》进入 $subDir 目录 ==》开始拉取git项目" || handle_error "$subDir 无法进入"
    git pull || handle_error "Git pull 失败"
fi

log "$subDir==》git拉取成功"

# 安装依赖
log "-------开始安装依赖-------"
pnpm install >> "$log_file" 2>&1 || handle_error "install 失败"
log "-------安装依赖完成-------"

# 启动项目
log "-------开始编译-------"
pnpm run build >> "$log_file" 2>&1 || handle_error "build 失败"
log "-------编译完成-------"

# 将dist内部文件复制到指定目录
log "-------开始复制dist-------"

# 判断是否有指定目录 当存在时删除该文件下所有文件 不存在时传教该目录
if [ -d "$workDir" ]; then
    rm -rf "$workDir"/* || handle_error "$workDir 下文件删除失败"

    # 使用 find 命令找到目录中的所有文件，但排除特定文件，并删除它们
    # find "$directory" -type f ! -name "file_to_keep1" ! -name "file_to_keep2" -delete
else
    mkdir "$workDir" || handle_error "$workDir 无法创建"
fi

cp -r dist/* "$workDir" || handle_error "cp 失败"
log "-------复制dist完成-------"

# 删除目录
log "-------开始删除 $subDir-------"
rm -rf "$subDir" || handle_error "rm $subDir 失败"
log "-------删除 $subDir 完成-------"

# 输出部署完成
log "***********部署完成**************"

# 写入换行符
echo -e "\n" >> $log_file




