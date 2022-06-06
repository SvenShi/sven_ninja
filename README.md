# 2022/06/06更新
添加登录功能

移除用户上线 下线通知功能

移除所有无用代码

# 2022/04/24更新
移除提交WSKEY功能

更换请求接口为青龙OpenAPI接口,废弃之前的api接口。适配高版本。

改用OpenAPI解决以往token过期需要重新登录一次青龙的问题

需要再.env文件中配置青龙的应用授权令牌

# Ninja

支持CK注册，登录和删除，支持WSKEY录入和删除，登录成功进入个人中心，可修改备注。默认登录CK才可提交WSCK，主页提交WSCK容易乱，不建议。

基本功能已完善，鸽几天，有问题先仔细看此README。

## 致谢

感谢Ninja原作者：@MoonBegonia

仓库地址：https://github.com/MoonBegonia/ninja

感谢WSCK功能原作者：@huiyi9420

仓库地址：https://github.com/huiyi9420/ninja


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
   git clone https://github.com/Waikkii/waikiki_ninja.git /ql/ninja
   cd /ql/ninja/backend
   pnpm install
   cp .env.example .env # 如有需要, 修改.env
   pm2 start
   cp sendNotify.js /ql/scripts/sendNotify.js
   ```

3. 将以下内容粘贴到 `extra.sh`（重启后自动更新并启动 Ninja）

   ```bash
   cd /ql/ninja/backend
   git checkout .
   git pull
   pnpm install
   pm2 start
   cp sendNotify.js /ql/scripts/sendNotify.js
   ```

### 容器外

此种方式需要宿主机安装 `node` `pnpm` 等环境，不做过多介绍。

使用此种方法无法跟随青龙一起启动，**无法发送扫码通知**，请知悉。

```bash
git clone https://github.com/Waikkii/waikiki_ninja.git
cd ninja/backend
pnpm install
# 复制 sendNotify.js 到容器内 scripts 目录，`qinglong` 为容器名
sudo docker cp sendNotify.js qinglong:/ql/scripts/sendNotify.js
cp .env.example .env
# 修改env文件
vi .env
node app.js
```

在 `.env` 文件中添加以下内容：

```bash
QL_DIR=qinglong 容器的本地路径
QL_URL=http://localhost:5700
```

`node app.js` 想要在后台运行可以使用 `&` `nohup` `screen` 等命令。

### Ninja 环境变量

目前支持的环境变量有：

- `CLIENT_ID`：青龙授权id（必填）
- `CLIENT_SECRET`：青龙授权密码（必填）
- `ALLOW_ADD`: 是否允许添加账号 不允许添加时则只允许已有账号登录（默认 `true`）
- `ALLOW_NUM`: 允许添加账号的最大数量（默认 `45`）
- `NINJA_PORT`: Ninja 运行端口（默认 `5701`）
-

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

- Qinglong 需要在登录状态（`auth.json` 中有 token）

## 如何更新Ninja

```bash
cd /ql/ninja
git checkout .
git pull
cd backend
pm2 start
```

## 如何删除Ninja

```bash
cd /ql/ninja
pm2 delete ninja
rm -rf *
rm -r ./.*
```
