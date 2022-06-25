/* eslint-disable camelcase */
'use strict';
const DEF_CONFIG = {
    allowAdd: process.env.ALLOW_ADD,
    allowNum: process.env.ALLOW_NUM,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    allowAdmin: process.env.ALLOW_ADMIN,
    usernameSalt: process.env.USERNAME_SALT,
    adminUsername: process.env.ADMIN_USERNAME,
    adminPassword: process.env.ADMIN_PASSWORD,
};
module.exports = class NinjaConfig {
    constructor({ allowAdd, allowNum, clientId, clientSecret, allowAdmin, usernameSalt, adminUsername, adminPassword }) {
        this.allowAdd = Boolean(allowAdd);
        this.allowNum = allowNum;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.allowAdmin = Boolean(allowAdmin);
        this.usernameSalt = usernameSalt;
        this.adminUsername = adminUsername;
        this.adminPassword = adminPassword;
        this.allowSetStatus = true;
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new NinjaConfig(DEF_CONFIG)
            return this.instance;
        }
        return this.instance;
    }
    saveConfig(newConfig) {
        let instance = NinjaConfig.getInstance();
        instance.allowAdd = newConfig.allowAdd;
        instance.allowNum = newConfig.allowNum;
        instance.clientId = newConfig.clientId;
        instance.clientSecret = newConfig.clientSecret;
        instance.allowAdmin = newConfig.allowAdmin;
        instance.usernameSalt = newConfig.usernameSalt;
        instance.adminUsername = newConfig.adminUsername;
        instance.adminPassword = newConfig.adminPassword;
        instance.allowSetStatus = newConfig.allowSetStatus;
    }
};
