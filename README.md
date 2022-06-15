
# Ninja

&emsp;&emsp;Ninja是一个青龙面板的环境变量添加工具，通过调用青龙面板开放的OpenApi即可实现无需登录青龙面板对环境变量进行控制。本版本Ninja由作者从Waikiki版本修改而来，主要修改的内容如下：

* 抛弃原先的使用读取青龙`auth.json`获取调用权限，改用OpenApi方式获取远程调用权限（适配高版本，并且解决以往需要固定时间登陆一次青龙容器问题，否则获取不到容量）
* 移除WSKEY添加功能 （后续会加回来）
* 修改添加CK的逻辑，改为先注册后登录，再去添加CK;

### 本版本功能列表

- [x] **支持管理员自定义提示信息功能**
- [x] 支持用户注册并登录
- [x] 支持用户查看CK的禁用和启用状态
- [x] 支持用户删除账号
- [x] **自动登录验证加密后的用户名，保证账号安全**
- [x] 支持Cookie添加功能
- [ ] 支持WSKEY添加功能（待实现）
- [ ] 支持系统管理功能，控制可用数量，功能的开启与关闭（待实现）

## 致谢

感谢Ninja原作者：@MoonBegonia

仓库地址：https://github.com/MoonBegonia/ninja

基于@Waikiki版本修改：

仓库地址：https://github.com/Waikkii/Waikiki_ninja

## 文档

### Ninja 环境变量

目前支持的环境变量有：

- `CLIENT_ID`：<font style="color:#e4002b">青龙授权id</font>（必填）
- `CLIENT_SECRET`：<font style="color:#e4002b">青龙授权密码</font>（必填）
- `ALLOW_ADD`: 是否允许添加账号 不允许添加时则只允许已有账号登录（默认 `true`）
- `ALLOW_NUM`: 允许添加账号的最大数量（默认 `20`）
- `NINJA_PORT`: Ninja 运行端口（默认 `5701`）
- `ALLOW_ADMIN`: 是否开启管理员账号（默认 `false`，`true`开启）
- `ADMIN_USERNAME`: 管理员账号（默认 `admin`）
- `ADMIN_PASSWORD`: 管理员密码（默认 `123456`）
- `USERNAME_SALT`: 用户名加密密钥(默认`ninja123`)

变量特别说明</br>
- `USERNAME_SALT`: 强烈建议修改此项，内容可以随意填写，但是长度必须为8的倍数 8,16,24,32... 系统将根据该值来对用户名进行加密
- `ALLOW_ADMIN`: 默认关闭，建议开启，开启后通过环境变量中配置的管理员账号密码登录后可以进入到管理页面对Ninja系统进行管理，自定义提示信息，开启后注意要修改环境变量中的管理员账号密码，以防被别人利用。
- `CLIENT_ID`,`CLIENT_SECRET`: 在青龙控制面板的 `系统设置-应用设置-新建应用` 添加用于Ninja的授权信息,给予Ninja环境变量的访问权限。

配置方式：

```bash
cd /ql/ninja/backend
cp .env.example .env
vi .env
pm2 start
```

**修改完成后需要 `pm2 start` 重启生效 ！！！**

### Ninja部署到Docker

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

2. 进入青龙容器内执行以下命令

   进入容器命令 `docker exec -it qinglong bash` 需要对应容器名

   ```bash
   git clone https://github.com/sw-ashai/ashai_ninja.git /ql/ninja
   cd /ql/ninja/backend
   pnpm install
   cp .env.example .env
   ```
3. 修改环境变量

   打开环境变量配置文件
   ```bash
   vi .env
   ```

   在 `.env` 文件中添加以下内容：
   
   ```bash
   QL_URL=http://localhost:5700 #青龙端口如果为5700 则无需添加此变量
   ```
   在 `.env` 文件中修改以下内容：
   ```bash
   #青龙授权令牌 在青龙容器设置中获取
   CLIENT_ID=***********
   CLIENT_SECRET=********
   #用户名加密密钥，强烈建议修改 可以随意填写任何内容但是长度必须为8的倍数 8 16 24 32 系统将根据该值来对用户名进行加密
   USERNAME_SALT:ninja123
   ```
   
4. 启动Ninja
   ```bash
   pm2 start
   ```

5. 将以下内容粘贴到 `extra.sh`（重启后自动更新并启动 Ninja）

   可在青龙面板的配置文件菜单中找到`extra.sh`

   ```bash
   cd /ql/ninja/backend
   git checkout .
   git pull
   pnpm install
   pm2 start
   ```

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


## 特别声明

* 本仓库涉仅用于测试和学习研究，禁止用于商业用途，不能保证其合法性，准确性，完整性和有效性，请根据情况自行判断.

* 本项目内所有资源文件，禁止任何公众号、自媒体进行任何形式的转载、发布。

* 作者对任何代码问题概不负责，包括但不限于由任何脚本错误导致的任何损失或损害.

* 间接使用本仓库搭建的任何用户，包括但不限于建立VPS或在某些行为违反国家/地区法律或相关法规的情况下进行传播, 作者对于由此引起的任何隐私泄漏或其他后果概不负责.

* 请勿将本项目的任何内容用于商业或非法目的，否则后果自负.

* 如果任何单位或个人认为该项目的脚本可能涉嫌侵犯其权利，则应及时通知并提供身份证明，所有权证明，我们将在收到认证文件后删除相关代码.

* 任何以任何方式查看此项目的人或直接或间接使用本仓库项目的使用者都应仔细阅读此声明。作者保留随时更改或补充此免责声明的权利。**一旦使用并复制了本仓库的项目，则视为您已接受此免责声明。**

**您必须在下载后的24小时内从计算机或手机中完全删除以上内容.**  
</br>
> ***您使用或者复制了本仓库且本人制作的项目，则视为`已接受`此声明，请仔细阅读***
