/* eslint-disable camelcase */
'use strict';
require('dotenv').config();

const {
  addEnv, delEnv, getEnvs, updateEnv, disable, enable
} = require('./ql');
const {
  encrypt, decrypt
} = require('../util/encryptUtil')
const {v4: uuidv4} = require('uuid');
const NinjaConfig = require('../util/ninjaConfig');
const JsonResult = require('../util/jsonResult');
const cache = require("../util/cache");

module.exports = class User {
  ptKey;
  ptPin;
  eid;
  username;
  password;
  token;
  ck;
  encryptUsername

  /**
   * 构造方法
   * @param ptKey ck ptKey
   * @param ptPin ck ptPin
   * @param eid 青龙容器中的id 容器中为id
   * @param username 用户名 容器中改为remarks
   * @param ck  cookie
   * @param password 密码 仅用于管理员登录
   * @param token token 仅用于管理员操作验证
   * @param encryptUsername 加密的用户名 自动登录时验证
   */
  constructor({
    ptKey, ptPin, eid, username, ck, password, token, encryptUsername
  }) {
    this.ptKey = ptKey
    this.ptPin = ptPin
    this.password = password
    if (ptKey && ptPin) {
      this.cookie = 'pt_key=' + this.ptKey + ';pt_pin=' + this.ptPin + ';';
    }
    this.eid = Number(eid)
    this.username = username
    this.token = token
    this.ck = ck
    this.encryptUsername = encryptUsername
  }

  /**
   * 登录
   */
  async login() {
    let config = NinjaConfig.getConfig()
    if (this.username === config.adminUsername) {
      if (config.allowAdmin) {
        //管理员登录
        if (this.password) {
          if (this.password === config.adminPassword) {
            let uuid = uuidv4();
            cache.setExpire(uuid, this.username, 1000 * 60 * 5)
            return JsonResult.success({username: config.adminUsername, eid: 0, token: uuid});
          } else {
            return JsonResult.error('用户名或密码不匹配', {username: config.adminUsername})
          }
        } else {
          return JsonResult.success({isAdmin: true})
        }
      } else {
        return JsonResult.error('该账号未启用，禁止登录', {username: config.adminUsername})
      }
    }

    const envs = await getEnvs();
    const env = await envs.find(item => item.remarks === this.username);
    if (env) {
      let encryptUsername = encrypt(this.username)
      return JsonResult.success({username: env.remarks, eid: env.id, timestamp: env.timestamp, encryptUsername});
    } else {
      return JsonResult.error('未注册的用户', {username: config.adminUsername})
    }
  }

  /**
   * 验证token是否匹配 用于管理页面的token验证
   */
  async verifyToken() {
    if (cache.hasKey(this.token)) {
      cache.delete(this.token)
      return JsonResult.success()
    } else {
      return JsonResult.error()
    }
  }

  /**
   * 注册
   */
  async register() {
    let config = NinjaConfig.getConfig()
    if (this.username === config.adminUsername) {
      return JsonResult.error('用户已存在')
    }

    const envs = await getEnvs();
    const poolInfo = await User.getPoolInfo();
    const env = await envs.find(item => item.remarks === this.username);
    if (!env) {
      // 新用户
      if (!config.allowAdd) {
        return JsonResult.error('注册功能已关闭，禁止注册')
      } else if (poolInfo.marginCount === 0) {
        return JsonResult.error('容量已达上限！')
      } else {
        const remarks = this.username
        const body = await addEnv(this.cookie, remarks);
        this.eid = body.data[0].id;
        this.timestamp = body.data[0].timestamp;
        return JsonResult.success(`注册成功，欢迎你${this.username}`, {
          username: this.username, eid: this.eid, timestamp: this.timestamp
        })
      }
    } else {
      return JsonResult.error('用户已存在')
    }
  }

  /**
   * 根据青龙容器中的ID获取用户信息
   */
  async getUserInfoByEid() {

    const envs = await getEnvs();
    const env = await envs.find((item) => item.id * 1 === this.eid * 1);
    if (!env) {
      return JsonResult.error('登录信息验证失败，请重新登录')
    }
    this.cookie = env.value;
    this.timestamp = env.timestamp;
    this.username = env.remarks
    let decryptUsername = decrypt(this.encryptUsername)
    if (decryptUsername !== this.username) {
      return JsonResult.error('登录信息验证失败，请重新登录')
    }
    this.cookie = env.value;
    this.timestamp = env.timestamp;
    this.username = env.remarks
    return JsonResult.success({
      username: this.username, eid: this.eid, timestamp: this.timestamp, status: env.status
    })
  }

  /**
   * 更新青龙容器中的环境变量 ，通过id来进行更新
   */
  async update() {
    if (!this.eid) {
      return JsonResult.error('登录信息验证失败，请重新登录')
    }
    const envs = await getEnvs();
    const env = await envs.find((item) => item.id === this.eid);
    if (!env) {
      return JsonResult.error('登录信息验证失败，请重新登录')
    }
    let cookie;
    if (this.ck) {
      cookie = this.ck
    } else {
      cookie = env.value
    }
    let remarks;
    if (this.username) {
      remarks = this.username;
      let user = envs.find(item => item.remarks === this.username)
      if (user) {
        return JsonResult.error('用户名已被占用')
      }
    } else {
      remarks = env.remarks
    }
    await updateEnv(cookie, this.eid, remarks);
    return JsonResult.success('修改成功')
  }

  /**
   * 根据青龙容器id删除环境变量
   */
  async delUserByEid() {
    await this.getUserInfoByEid();
    await delEnv(this.eid);
    return JsonResult.success('账号删除成功')
  }

  /**
   * 根据青龙容器id禁用环境变量
   */
  async disableEnv() {
    await this.getUserInfoByEid();
    await disable(this.eid);
    return JsonResult.success("禁用成功")
  }

  /**
   * 根据青龙容器id启用环境变量
   */
  async enableEnv() {
    await this.getUserInfoByEid();
    await enable(this.eid);
    return JsonResult.success("启用成功")
  }

  /**
   * 获取当前系统容量以及可公开的配置信息
   */
  static async getPoolInfo() {
    const envs = await getEnvs();
    let userNames = new Set()
    envs.map(item => {
      userNames.add(item.remarks);
    })
    let config = NinjaConfig.getConfig()

    return JsonResult.success({
      marginCount: config.allowNum - userNames.size,
      allowAdd: config.allowAdd,
      allowSetStatus: config.allowSetStatus
    })
  }

  /**
   *  获取所有的配置信息  需要验证token
   */
  async getAllConfig() {
    if (cache.hasKey(this.token)) {
      cache.delete(this.token)
      return JsonResult.success(NinjaConfig.getConfig())
    } else {
      return JsonResult.error('您无权操作')
    }
  }

  /**
   *  保存配置信息  需要验证token
   */
  async saveConfig(config) {
    if (this.token === staticToken) {
      NinjaConfig.saveConfig(config)
      return JsonResult.success('修改成功')
    } else {
      return JsonResult.error('您无权操作')
    }
  }
};
