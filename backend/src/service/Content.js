/* eslint-disable camelcase */
'use strict';

let fs = require("fs")
const JsonResult = require('../util/jsonResult');


module.exports = class Content {
    fileName;
    fileContent;

    constructor({fileName, fileContent}) {
        this.fileName = './static/' + fileName + '.txt'
        this.fileContent = fileContent
    }

    async writFile() {
        fs.writeFileSync(this.fileName, this.fileContent)
        return JsonResult.success('修改成功')
    }

    async readFile() {
        let buffer = fs.readFileSync(this.fileName)
        return JsonResult.success({content: buffer.toString()})
    }
};
