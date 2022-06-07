'use strict';
const got = require('got');
require('dotenv').config();

const api = got.extend({
    prefixUrl: process.env.QL_URL || 'http://localhost:5700/',
    retry: {limit: 0},
});

const qlClient = {
    clientId: process.env.CLIENT_ID, clientSecret: process.env.CLIENT_SECRET
}


async function getToken() {
    const body = await api({
        url: 'open/auth/token', searchParams: {
            client_id: qlClient.clientId, client_secret: qlClient.clientSecret,
        }
    }).json();
    if (body.code !== 200) {
        throw new QLError("青龙令牌配置错误，请检查.env文件配置是否正确！", 400, 400)
    }
    return body.data.token;
}

module.exports.getToken = async () => {
    const body = await api({
        url: 'open/auth/token', searchParams: {
            client_id: qlClient.clientId, client_secret: qlClient.clientSecret,
        }
    }).json();
    if (body.code !== 200) {
        throw new QLError("青龙令牌配置错误，请检查.env文件配置是否正确！", 400, 400)
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
    return body.data;
};

module.exports.getEnvsCount = async () => {
    const data = await this.getEnvs();
    return data.length;
};

module.exports.addEnv = async (cookie, remarks) => {
    const token = await getToken();
    return api({
        method: 'post', url: 'open/envs', params: {t: Date.now()}, json: [{
            name: 'JD_COOKIE', value: cookie, remarks,
        }], headers: {
            Accept: 'application/json',
            authorization: `Bearer ${token}`,
            'Content-Type': 'application/json;charset=UTF-8',
        },
    }).json()
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
    return body;
};

module.exports.disable = async (eid) => {
    const token = await getToken();
    const body = await api({
        method: 'put', url: 'open/disable', params: {t: Date.now()}, body: JSON.stringify([eid]), headers: {
            Accept: 'application/json',
            authorization: `Bearer ${token}`,
            'Content-Type': 'application/json;charset=UTF-8',
        },
    }).json();
    return body;
};

module.exports.enable = async (eid) => {
    const token = await getToken();
    const body = await api({
        method: 'put', url: 'open/enable', params: {t: Date.now()}, body: JSON.stringify([eid]), headers: {
            Accept: 'application/json',
            authorization: `Bearer ${token}`,
            'Content-Type': 'application/json;charset=UTF-8',
        },
    }).json();
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
