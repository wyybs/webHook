# pm2 容器
FROM pm2:latest
# 设置工作空间
WORKDIR /usr/src/app
# 拷贝源码
COPY . .
RUN npm config set registry https://registry.npm.taobao.org/ && \
  # 安装依赖
  RUN npm install


