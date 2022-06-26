/* eslint-disable camelcase */
'use strict';
const {v4: uuidv4} = require('uuid');
let fs = require("fs")
const filePrefixPath = './src/db/'
const fileSuffixPath = '.json'

const dbMap = new Map()

module.exports = class DbUtil {
    dbName;
    dbPath;
    db;
    init;

    constructor(dbName) {
        this.dbName = dbName
        this.dbPath = filePrefixPath + dbName + fileSuffixPath
        this.init = false
        this.initDbData()
    }

    /**
     * 获取实例
     */
    static getInstance(dbName) {
        let dbUtil = dbMap.get(dbName)
        if (!dbUtil) {
            dbUtil = new DbUtil(dbName)
            dbMap.set(dbName, dbUtil);
        }else {
            dbUtil.init = false
        }
        return dbUtil;
    }


    /**
     * 初始化dbUtil
     */
    initDbData() {
        if (!fs.existsSync(this.dbPath)) {
            fs.writeFileSync(this.dbPath, '')
        }
        if (!fs.existsSync(filePrefixPath)) {
            fs.mkdirSync(filePrefixPath)
        }
        if (!fs.existsSync(this.dbPath)) {
            fs.writeFileSync(this.dbPath, '')
        }
        let buffer = fs.readFileSync(this.dbPath)
        let dataStr = buffer.toString()
        let db = {};
        if (dataStr) {
            db = JSON.parse(dataStr)
            let data = new Map()
            for (let dataKey in db.data) {
                data.set(dataKey, db.data[dataKey])
            }
            db.data = data
        } else {
            db.data = new Map()
            db.name = this.dbName
            db.length = 0
            db.index = 0;
            db.updateDate = new Date();
            this.init = true
            let dbStr = JSON.stringify(db)
            fs.writeFileSync(this.dbPath, dbStr);
        }
        this.db = db;
    }

    saveToFile() {
        this.db.updateDate = new Date()
        this.db.length = this.db.data.size
        let dataMap = this.db.data;
        let data = {}
        dataMap.forEach((value, key) => {
            data[key] = value;
        })
        this.db.data = data
        fs.writeFileSync(this.dbPath, JSON.stringify(this.db))
        this.db.data = dataMap
    }


    insert(data) {
        this.db.index++
        data._id = uuidv4();
        data._index = this.db.index
        if (this.db.data.size > 0 || Object.keys(this.db.data).length !== 0) {
            this.db.data.set(data._id, data);
        } else {
            this.db.data = new Map()
            this.db.data.set(data._id, data);
        }
        this.saveToFile()
        return data._id
    }

    get(id) {
        return this.db.data.get(id)
    }

    update(data) {
        let oldValue = this.db.data.get(data._id)
        for (let dataKey in data) {
            oldValue[dataKey] = data[dataKey]
        }
        this.saveToFile()
    }

    delete(id) {
        this.db.data.delete(id)
        this.saveToFile()
    }

    selectAll() {
        if (this.db.data.size > 0){
            return Array.from(this.db.data.values())
        }else {
            return []
        }
    }

};
