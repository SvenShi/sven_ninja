/* eslint-disable camelcase */
'use strict';
let fs = require("fs")
const FILE_PATH = './src/db/config.json'

const DEF_CONFIG = {
    allowAdd: Boolean(process.env.ALLOW_ADD) || true,
    allowNum: Number(process.env.ALLOW_NUM) || 20,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    allowAdmin: Boolean(process.env.ALLOW_ADMIN) || true,
    usernameSalt: process.env.USERNAME_SALT || 'ninja123',
    adminUsername: process.env.ADMIN_USERNAME || 'admin',
    adminPassword: process.env.ADMIN_PASSWORD || '123456',
    allowSetStatus: true,
};

module.exports = class NinjaConfig {
    static configData;

    static getConfig() {
        if (!this.configData) {
            let buffer = fs.readFileSync(FILE_PATH)
            let configStr = buffer.toString()
            if (configStr) {
                this.configData = JSON.parse(configStr)
            } else {
                fs.writeFile(FILE_PATH, JSON.stringify(DEF_CONFIG), (err) => {
                    if (err) {
                        throw err;
                    }
                })
                this.configData = DEF_CONFIG
            }
        }
        return this.configData
    }

    static saveConfig(config) {
        this.configData = config;
        fs.writeFile(FILE_PATH, JSON.stringify(config), (err) => {
            if (err) {
                throw err;
            }
        })
    }

};
