/* eslint-disable camelcase */
'use strict';

/**
 * 操作成功
 */
const SUCCESS = 200;
/**
 * 系统内部错误
 */
const ERROR = 500;


module.exports = class JsonResult {

    data;
    code;
    msg;

    constructor({data, code, msg}) {
        this.data = data
        this.code = code
        this.msg = msg
    }

    /**
     * 响应错误  res data 可以随意组合传入 自动判断那个是对象那个是消息
     */
    static error(res, data) {
        if (res) {
            if (data) {
                if (typeof res === 'object') {
                    return new JsonResult({data: res, code: ERROR, msg: data})
                } else {
                    return new JsonResult({data: data, code: ERROR, msg: res})
                }
            } else {
                if (typeof res === 'object') {
                    return new JsonResult({data: res, code: ERROR, msg: '操作失败'})
                } else {
                    return new JsonResult({code: ERROR, msg: res})
                }
            }
        }else {
            if (data){
                return new JsonResult({data: data, code: ERROR, msg: '操作失败'})
            }else {
                return new JsonResult({code: ERROR, msg: '操作失败'})
            }
        }
    }

    /**
     * 响应成功
     */
    static success(res, data) {
        if (res) {
            if (data) {
                if (typeof res === 'object') {
                    return new JsonResult({data: res, code: SUCCESS, msg: data})
                } else {
                    return new JsonResult({data: data, code: SUCCESS, msg: res})
                }
            } else {
                if (typeof res === 'object') {
                    return new JsonResult({data: res, code: SUCCESS, msg: '操作成功'})
                } else {
                    return new JsonResult({code: SUCCESS, msg: res})
                }
            }
        }else {
            if (data){
                return new JsonResult({data: data, code: SUCCESS, msg: '操作成功'})
            }else {
                return new JsonResult({code: SUCCESS, msg: '操作成功'})
            }
        }
    }

};
