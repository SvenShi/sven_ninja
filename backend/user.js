/* eslint-disable camelcase */
'use strict';

const got = require('got');
require('dotenv').config();
const {
    addEnv,
    delEnv,
    getEnvs,
    getEnvsCount,
    updateEnv,
    getWSCKEnvsCount
} = require('./ql');
const path = require('path');
const qlDir = process.env.QL_DIR || '/ql';
const notifyFile = path.join(qlDir, 'shell/notify.sh');
const {exec} = require('child_process');

const api = got.extend({
    retry: {limit: 0},
    responseType: 'json',
});

module.exports = class User {
    ua;
    pt_key;
    pt_pin;
    pin;// 新增变量
    code;// 新增变量
    msg;// 新增变量
    cookie;
    eid;
    wseid;
    timestamp;
    nickName;
    token;
    okl_token;
    cookies;
    QRCode;
    remark;

    // 新增wskey构造入参
    constructor({
                    token,
                    okl_token,
                    cookies,
                    pt_key,
                    pt_pin,
                    cookie,
                    eid,
                    wseid,
                    remarks,
                    remark,
                    ua,
                    pin,
                    nickName
                }) {
        this.token = token;
        this.okl_token = okl_token;
        this.cookies = cookies;
        this.pt_key = pt_key;
        this.pt_pin = pt_pin;
        this.cookie = cookie;
        this.eid = eid;
        this.wseid = wseid;
        this.remark = remark;
        this.ua = ua;
        this.nickName = nickName;

        if (pt_key && pt_pin) {
            this.cookie = 'pt_key=' + this.pt_key + ';pt_pin=' + this.pt_pin + ';';
        }

        if (cookie) {
            this.pt_pin = cookie.match(/pt_pin=(.*?);/)[1];
            this.pt_key = cookie.match(/pt_key=(.*?);/)[1];
        }

        if (remarks) {
            this.remark = remarks.match(/remark=(.*?);/) && remarks.match(/remark=(.*?);/)[1];
        }
        // 新增pin
        this.pin = pin;


        // 新增如果备注是空则默认取pt_pin作为备注
        if (this.remark === null || this.remark === '') {
            this.remark = this.pin;
        }

        // 新增如果nickName是空默认取pt_pin作为备注
        if (this.nickName === null || this.nickName === '') {
            this.nickName = this.pin;
        }
    }

    async CKLogin() {
        let message;
        await this.#getNickname();
        const envs = await getEnvs();
        const poolInfo = await User.getPoolInfo();
        const env = await envs.find((item) => item.value.match(/pt_pin=(.*?);/)[1] === this.pt_pin);
        if (!env) {
            // 新用户
            if (!poolInfo.allowAdd) {
                throw new UserError('管理员已关闭注册，去其他地方看看吧', 210, 200);
            } else if (poolInfo.marginCount === 0) {
                throw new UserError('本站已到达注册上限，你来晚啦', 211, 200);
            } else {
                const remarks = `remark=${this.nickName};`;
                const body = await addEnv(this.cookie, remarks);
                if (body.code !== 200) {
                    throw new UserError(body.message || '添加账户错误，请重试', 220, body.code || 200);
                }
                this.eid = body.data[0].id;
                this.timestamp = body.data[0].timestamp;
                message = `注册成功，${this.nickName}`;
                this.#sendNotify('Ninja 运行通知', `用户 ${this.nickName}(${decodeURIComponent(this.pt_pin)}) 已上线`);
            }
        } else {
            this.eid = env.id;
            const remarks = `remark=${this.nickName};`;
            const body = await updateEnv(this.cookie, this.eid, remarks);
            if (body.code !== 200) {
                throw new UserError(body.message || '更新账户错误，请重试', 221, body.code || 200);
            }
            this.timestamp = body.data.timestamp;
            message = `欢迎回来，${this.nickName}`;
            this.#sendNotify('Ninja 运行通知', `用户 ${this.nickName}(${decodeURIComponent(this.pt_pin)}) 已更新 CK`);
        }
        return {
            nickName: this.nickName,
            eid: this.eid,
            timestamp: this.timestamp,
            message,
        };
    }

    async getUserInfoByEid() {
        const envs = await getEnvs();
        const env = await envs.find((item) => item.id * 1 === this.eid * 1);
        if (!env) {
            throw new UserError('没有找到这个账户，重新登录试试看哦', 230, 200);
        }
        this.cookie = env.value;
        this.timestamp = env.timestamp;
        const remarks = env.remarks;
        if (remarks) {
            this.remark = remarks.match(/remark=(.*?);/) && remarks.match(/remark=(.*?);/)[1];
        }
        this.nickName = this.remark
        return {
            nickName: this.nickName,
            eid: this.eid,
            timestamp: this.timestamp,
            remark: this.remark,
            status: env.status
        };
    }

    async updateRemark() {
        if (!this.eid || !this.remark || this.remark.replace(/(^\s*)|(\s*$)/g, '') === '') {
            throw new UserError('eid参数错误', 240, 200);
        }

        const envs = await getEnvs();
        const env = await envs.find((item) => item.id === this.eid);
        if (!env) {
            throw new UserError('没有找到这个ck账户，重新登录试试看哦', 230, 200);
        }
        this.cookie = env.value;
        const remarks = `remark=${this.remark};`;

        const updateEnvBody = await updateEnv(this.cookie, this.eid, remarks);
        if (updateEnvBody.code !== 200) {
            throw new UserError('ck更新/上传备注出错，请重试', 241, 200);
        }

        return {
            message: 'ck更新/上传备注成功',
        };
    }

    async delUserByEid() {
        await this.getUserInfoByEid();
        const body = await delEnv(this.eid);
        if (body.code !== 200) {
            throw new UserError(body.message || '删除账户错误，请重试', 240, body.code || 200);
        }
        this.#sendNotify('Ninja 运行通知', `用户 ${this.nickName}(${decodeURIComponent(this.pt_pin)}) 删号跑路了`);
        return {
            message: '账户已移除',
        };
    }

/////////////////////////////////////////////////

    static async getPoolInfo() {
        const count = await getEnvsCount();
        const countWSCK = await getWSCKEnvsCount();
        const allowCount = (process.env.ALLOW_NUM || 40) - count;
        const allowWSCKCount = (process.env.ALLOW_WSCK_NUM || 40) - countWSCK;

        return {
            marginCount: allowCount >= 0 ? allowCount : 0,
            marginWSCKCount: allowWSCKCount >= 0 ? allowWSCKCount : 0,
            allowAdd: Boolean(process.env.ALLOW_ADD) || false,
        };
    }

    static async getUsers() {
        const envs = await getEnvs();
        const result = envs.map(async (env) => {
            const user = new User({cookie: env.value, remarks: env.remarks});
            await user.#getNickname(true);
            return {
                pt_pin: user.pt_pin,
                nickName: user.nickName,
                remark: user.remark || user.nickName,
            };
        });
        return Promise.all(result);
    }

    async #getNickname(nocheck) {
        if (!this.nickName){
            let body;
            let body_bak;
            body = await api({
                url: `https://me-api.jd.com/user_new/info/GetJDUserInfoUnion?orgFlag=JD_PinGou_New&callSource=mainorder&channel=4&isHomewhite=0&sceneval=2&_=${Date.now()}&sceneval=2&g_login_type=1&g_ty=ls`,
                headers: {
                    Accept: '*/*',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Accept-Language': 'zh-cn',
                    Connection: 'keep-alive',
                    Cookie: this.cookie,
                    Referer: 'https://home.m.jd.com/myJd/newhome.action',
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36',
                    Host: 'me-api.jd.com',
                },
            }).json();

            if (!body.data?.userInfo && !nocheck) {
                body_bak = await api({
                    url: `https://wq.jd.com/user_new/info/GetJDUserInfoUnion?orgFlag=JD_PinGou_New&callSource=mainorder`,
                    headers: {
                        Connection: 'keep-alive',
                        Cookie: this.cookie,
                        Referer: 'https://home.m.jd.com/myJd/home.action',
                        'User-Agent':
                            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36',
                    },
                }).json();
            }

            if (!body.data?.userInfo && !body_bak?.data.userInfo && !nocheck) {
                throw new UserError('获取用户信息失败，请检查您的 wskey ！', 201, 200);
            } else if (!body.data?.userInfo && !body_bak?.data.userInfo && !nocheck) {
                throw new UserError('获取用户信息失败，请检查您的 cookie ！', 201, 200);
            }
            this.nickName = (body.data?.userInfo.baseInfo.nickname || body_bak?.data.userInfo.baseInfo.nickname) || decodeURIComponent(this.pt_pin);
        }
    }

    #sendNotify(title, content) {
        const notify = process.env.NINJA_NOTIFY || true;
        if (!notify) {
            console.log('Ninja 通知已关闭\n' + title + '\n' + content + '\n' + '已跳过发送');
            return;
        }
        exec(`${notifyFile} "${title}" "${content}"`, (error, stdout, stderr) => {
            if (error) {
                console.log(stderr);
            } else {
                console.log(stdout);
            }
        });
    }

};

class UserError extends Error {
    constructor(message, status, statusCode) {
        super(message);
        this.name = 'UserError';
        this.status = status;
        this.statusCode = statusCode || 200;
    }
}
