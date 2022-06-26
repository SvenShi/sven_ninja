'use strict';
const got = require('got');
require('dotenv').config();

const api = got.extend({
    prefixUrl: process.env.QL_URL || 'http://localhost:5700/',
    retry: {limit: 0},
});

const NinjaConfig = require('../util/ninjaConfig');


async function getToken() {
    let config = NinjaConfig.getConfig()
    const body = await api({
        url: 'open/auth/token', searchParams: {
            client_id: config.clientId, client_secret: config.clientSecret,
        }
    }).json();
    if (body.code !== 200) {
        throw new QLError("青龙令牌配置错误，请前往管理页面配置！", 500)
    }
    return body.data.token;
}

module.exports.getToken = async () => {
    let config = NinjaConfig.getConfig()
    const body = await api({
        url: 'open/auth/token', searchParams: {
            client_id: config.clientId, client_secret: config.clientSecret,
        }
    }).json();
    if (body.code !== 200) {
        throw new QLError("青龙令牌配置错误，请前往管理页面配置！", 500)
    }
    return body.data.token;
}

module.exports.getEnvs = async () => {
    const token = await getToken();
    const body = await api({
        url: 'open/envs', searchParams: {
            searchValue: 'JD_COOKIE', t: Date.now(),
        }, headers: {
            Accept: 'application/json', authorization: `Bearer ${token}`,
        },
    }).json();
    if (body.code !== 200) {
        throw new QLError(body.message, body.code)
    }
    return body.data;
};

module.exports.addEnv = async (cookie, remarks) => {
    const token = await getToken();
    let body = await api({
        method: 'post', url: 'open/envs', params: {t: Date.now()}, json: [{
            name: 'JD_COOKIE', value: cookie, remarks,
        }], headers: {
            Accept: 'application/json',
            authorization: `Bearer ${token}`,
            'Content-Type': 'application/json;charset=UTF-8',
        },
    }).json()
    if (body.code !== 200) {
        throw new QLError(body.message, body.code)
    }
    return body
};

module.exports.updateEnv = async (cookie, eid, remarks) => {
    const token = await getToken();
    const body = await api({
        method: 'put', url: 'open/envs', params: {t: Date.now()}, json: {
            name: 'JD_COOKIE', value: cookie, id: eid, remarks,
        }, headers: {
            Accept: 'application/json',
            authorization: `Bearer ${token}`,
            'Content-Type': 'application/json;charset=UTF-8',
        },
    }).json();
    if (body.code !== 200) {
        throw new QLError(body.message, body.code)
    }
    return body;
};

module.exports.delEnv = async (eid) => {
    const token = await getToken();
    const body = await api({
        method: 'delete', url: 'open/envs', params: {t: Date.now()}, body: JSON.stringify([eid]), headers: {
            Accept: 'application/json',
            authorization: `Bearer ${token}`,
            'Content-Type': 'application/json;charset=UTF-8',
        },
    }).json();
    if (body.code !== 200) {
        throw new QLError(body.message, body.code)
    }
    return body;
};

module.exports.disable = async (eid) => {
    const token = await getToken();
    const body = await api({
        method: 'put', url: 'open/envs/disable', params: {t: Date.now()}, body: JSON.stringify([eid]), headers: {
            Accept: 'application/json',
            authorization: `Bearer ${token}`,
            'Content-Type': 'application/json;charset=UTF-8',
        },
    }).json();
    if (body.code !== 200) {
        throw new QLError(body.message, body.code)
    }
    return body;
};

module.exports.enable = async (eid) => {
    const token = await getToken();
    const body = await api({
        method: 'put', url: 'open/envs/enable', params: {t: Date.now()}, body: JSON.stringify([eid]), headers: {
            Accept: 'application/json',
            authorization: `Bearer ${token}`,
            'Content-Type': 'application/json;charset=UTF-8',
        },
    }).json();
    if (body.code !== 200) {
        throw new QLError(body.message, body.code)
    }
    return body;
};

class QLError extends Error {
    constructor(message, status, statusCode) {
        super(message);
        this.name = 'QLError';
        this.status = status;
        this.statusCode = statusCode || 500;
    }
}
