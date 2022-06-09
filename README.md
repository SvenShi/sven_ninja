# 重要通知

如启动失败尝试在backend目录运行 `pnpm install` 安装依赖

# Ninja

支持CK注册，登录和删除，登录成功进入个人中心，可修改备注。

支持标语自定义

## 致谢

感谢Ninja原作者：@MoonBegonia

仓库地址：https://github.com/MoonBegonia/ninja

基于@Waikiki版本修改：

仓库地址：https://github.com/Waikkii/Waikiki_ninja

## 说明

Ninja 仅供学习参考使用，请于下载后的 24 小时内删除，本人不对使用过程中出现的任何问题负责，包括但不限于 `数据丢失` `数据泄露`。


## 文档

### 容器内

1. 容器映射 5701 端口，ninja 目录至宿主机

   例（docker-compose）：

   ```diff
   version: "3"
   services:
     qinglong:
       image: whyour/qinglong:latest
       container_name: qinglong
       restart: unless-stopped
       tty: true
       ports:
         - 5700:5700
   +      - 5701:5701
       environment:
         - ENABLE_HANGUP=true
         - ENABLE_WEB_PANEL=true
       volumes:
         - ./config:/ql/config
         - ./log:/ql/log
         - ./db:/ql/db
         - ./repo:/ql/repo
         - ./raw:/ql/raw
         - ./scripts:/ql/scripts
         - ./jbot:/ql/jbot
   +      - ./ninja:/ql/ninja
   ```

   例（docker-run）：

   ```diff
   docker run -dit \
     -v $PWD/ql/config:/ql/config \
     -v $PWD/ql/log:/ql/log \
     -v $PWD/ql/db:/ql/db \
     -v $PWD/ql/repo:/ql/repo \
     -v $PWD/ql/raw:/ql/raw \
     -v $PWD/ql/scripts:/ql/scripts \
     -v $PWD/ql/jbot:/ql/jbot \
   + -v $PWD/ql/ninja:/ql/ninja \
     -p 5700:5700 \
   + -p 5701:5701 \
     --name qinglong \
     --hostname qinglong \
     --restart unless-stopped \
     whyour/qinglong:latest
   ```

2. 进容器内执行以下命令

   **进容器内执行以下命令**

   ```bash
   git clone https://github.com/sw-ashai/ashai_ninja.git /ql/ninja
   cd /ql/ninja/backend
   pnpm install
   cp .env.example .env # 注意需要修改.env
   pm2 start
   ```

3. 将以下内容粘贴到 `extra.sh`（重启后自动更新并启动 Ninja）

   ```bash
   cd /ql/ninja/backend
   git checkout .
   git pull
   pnpm install
   pm2 start
   ```

### 容器外

此种方式需要宿主机安装 `node` `pnpm` 等环境，不做过多介绍。

使用此种方法无法跟随青龙一起启动，**无法发送扫码通知**，请知悉。

```bash
git clone https://github.com/sw-ashai/ashai_ninja.git
cd ninja/backend
pnpm install
cp .env.example .env
# 修改env文件
vi .env
node app.js
```

在 `.env` 文件中添加以下内容：

```bash
QL_URL=http://localhost:5700
#青龙授权令牌 在青龙容器设置中获取
CLIENT_ID=***********
CLIENT_SECRET=********
```

`node app.js` 想要在后台运行可以使用 `&` `nohup` `screen` 等命令。

### Ninja 环境变量

目前支持的环境变量有：

- `CLIENT_ID`：青龙授权id（必填）
- `CLIENT_SECRET`：青龙授权密码（必填）
- `ALLOW_ADD`: 是否允许添加账号 不允许添加时则只允许已有账号登录（默认 `true`）
- `ALLOW_NUM`: 允许添加账号的最大数量（默认 `20`）
- `NINJA_PORT`: Ninja 运行端口（默认 `5701`）
- `ALLOW_ADMIN`: 是否开启管理员账号（默认 `false`，`true`开启）
- `ADMIN_USERNAME`: 管理员账号（默认 `admin`） 
- `ADMIN_PASSWORD`: 管理员密码（默认 `123456`）
- `USERNAME_SALT`: 用户名加密密钥，强烈建议修改 可以随意填写任何内容但是长度必须为8的倍数 8 16 24 32 系统将根据该值来对用户名进行加密

配置方式：

```bash
cd /ql/ninja/backend
cp .env.example .env
vi .env
pm2 start
```

**修改完成后需要 `pm2 start` 重启生效 ！！！**


## 注意事项

- 重启后务必执行一次 `ql extra` 保证 Ninja 配置成功。

- 更新 Ninja 只需要在**容器**中 `ninja/backend` 目录执行 `git pull` 然后 `pm2 start`

## 如何更新Ninja

```bash
cd /ql/ninja
git checkout .
git pull
cd backend
pnpm install
pm2 start
```

## 如何删除Ninja

```bash
cd /ql/ninja
pm2 delete ninja
rm -rf *
rm -r ./.*
```
