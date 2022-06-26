/* eslint-disable camelcase */
'use strict';
const JsonResult = require('../util/jsonResult');
const DbUtil = require('../util/DbUtil');


const DEF_CONTENT = {
    tip: {
        content: "<p style=\"color: red\">撸豆有可能造成的任何损失本人概不负责！！！！！！！！！</p>\n" + "<p>为了您的财产安全请关闭免密支付以及打开支付验密（京东-设置-支付设置-支付验密设置）。</p>\n" + "<p>建议京东账户绑定微信以保证提现能到账。</p>\n" + "<p style=\"font-weight: bold;\">安全起见，切勿泄露您的cookie！</p>\n" + "<p style=\"font-weight: bold;\">如果本项目对你有帮助，请到github中star</p>\n",
        name: "登录以及注册上方提示"
    }, login: {
        content: '', name: "登录上方提示"
    }, profile: {
        content: '', name: "个人中心上方提示"
    }, register: {
        content: "<p>安卓手机傻瓜式获取CK（强烈推荐，非常方便）<a style=\"color: blue\"  href=\"https://github.com/ZhuSky/JDCookie\" target=\"_blank\">点此访问下载连接</a></p>\n" + "<p>电脑用户浏览器登录<a style=\"\" href=\"https://m.jd.com/\" target=\"_blank\">JD官网</a>，点击我的出现登录页面后点击F12，通过开发者工具获取cookie。</p>\n" + "<p>手机用户可以使用Alook浏览器登录<a style=\"\" href=\"https://m.jd.com/\" target=\"_blank\" id=\"jd\">JD官网</a>，并在菜单-工具箱-开发者工具-Cookies中获取（Android和iPhone通用）。</p>\n" + "<p>另外也可以使用抓包工具（iPhone：Stream，Android：HttpCanary）抓取京东app的ck</p>\n" + "<p>注册成功后使用用户名即可登录</p>\n" + "<span class=\"card-subtitle\" style=\"color: red\"> 可以直接填写整个cookie。</span><br/>\n" + "<span class=\"card-subtitle\" style=\"color: red\"> 注意格式（pt_key=xxxxxxxxxxxxxxx;pt_pin=xxxxxxxxxxxxxx;）注意分号不能少！</span><br/>\n" + "<span class=\"card-subtitle\"> 请在下方输入您的 cookie 注册。</span><br/>\n",
        name: "注册上方提示"
    }, cookie: {
        content: '', name: "自定义修改Cookie上方提示"
    }, username: {
        content: '', name: "修改用户名上方提示"
    }
}


module.exports = class Content {

    static getDb() {
        let dbUtil = DbUtil.getInstance("content")
        if (dbUtil.init || dbUtil.length === 0) {
            for (let key in DEF_CONTENT) {
                dbUtil.insert({location: key, ...DEF_CONTENT[key]})
            }
        }
        return dbUtil;
    }

    static getAllContent() {
        let dbUtil = this.getDb()
        let data = {}
        dbUtil.selectAll().forEach(item => {
            data[item.location] = item
        })
        return JsonResult.success(data)
    }

    static addContent(content) {
        let dbUtil = this.getDb()
        return JsonResult.success(dbUtil.insert(content))
    }

    static updateContent(content) {
        let dbUtil = this.getDb()
        return JsonResult.success(dbUtil.update(content))
    }

    static deleteContent(id) {
        let dbUtil = this.getDb()
        return JsonResult.success(dbUtil.delete(id))
    }
};
