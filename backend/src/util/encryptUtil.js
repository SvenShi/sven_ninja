'use strict';
const CryptoJS = require("crypto-js")
const NinjaConfig = require('./ninjaConfig');

//秘钥
const iv = CryptoJS.enc.Utf8.parse('thisprojectisshit');
const option = {
  iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7
}

function saltProcess(salt) {
  return salt || 'ninja';
}

/**
 * 加密
 * {param} plaintText 加密明文
 * return str 加密结果
 */
module.exports.encrypt = (plaintText) => {
  return CryptoJS.AES.encrypt(plaintText, saltProcess(NinjaConfig.getConfig().usernameSalt), option).toString();

}

/**
 * 解密
 * {param} plaintText 解密密文
 * return str 解密结果
 */
module.exports.decrypt = (encryptedBase64Str) => {
  let content = String(encryptedBase64Str);//把object转化为string
  let bytes = CryptoJS.AES.decrypt(content.toString(), saltProcess(NinjaConfig.getConfig().usernameSalt), option);

  return bytes.toString(CryptoJS.enc.Utf8);
}


