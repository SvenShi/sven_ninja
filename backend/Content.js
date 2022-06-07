/* eslint-disable camelcase */
'use strict';

let fs = require("fs")

module.exports = class Content {
    fileName;
    fileContent;

    constructor({fileName, fileContent}) {
        this.fileName = './static/' + fileName + '.txt'
        this.fileContent = fileContent
    }

    async writFile() {
        fs.writeFileSync(this.fileName, this.fileContent)
        return {code: 200}
    }

    async readFile() {
        let buffer = fs.readFileSync(this.fileName)
        return {
            code: 200, content: buffer.toString()
        }
    }
};
