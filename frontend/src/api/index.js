import ky from 'ky'

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const api = ky.create({prefixUrl: VITE_API_BASE_URL, retry: {limit: 0}})

export function getInfoAPI() {
    return api.get('info').json()
}

export function login(body) {
    return api.post('login', {json: body}).json()
}


export function registerUser(body) {
    return api.post('register', {json: body}).json()
}

export function verifyToken() {
    const token = localStorage.getItem('token')
    if (!token){
        return {
            data:{
                code:444
            }
        };
    }
    return api.post('verifyToken', {json: {token}}).json()
}


export function getUserInfoAPI(eid) {
    const searchParams = new URLSearchParams()
    searchParams.set('eid', eid)
    return api.get('userinfo', {searchParams: searchParams}).json()
}

export function delAccountAPI(body) {
    return api.post('delaccount', {json: body}).json()
}

export function updateAPI(body) {
    return api.post('update', {json: body}).json()
}

export function disableAPI(body) {
    return api.post('disable', {json: body}).json()
}

export function enableAPI(body) {
    return api.post('enable', {json: body}).json()
}

export function getContent(contentName) {
    const searchParams = new URLSearchParams()
    searchParams.set('contentName', contentName)
    return api.get('getContent', {searchParams: searchParams}).json()
}

export function setContent(body) {
    return api.post('setContent', {json: body}).json()
}

