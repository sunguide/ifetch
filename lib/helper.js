
const fs = require("fs");
const path = require("path");
module.exports = helper = {
    md5(str){
        let crypto = require("crypto");
        let md5 = crypto.createHash("md5");
        md5.update(str);
        str = md5.digest('hex');
        return str.toUpperCase();
    },

    datetime(format, timestamp){
        const moment = require("moment");
        if(timestamp){
            return moment(timestamp).format(format);
        }
        return moment().format(format);
    },
    JSON:{
        parse(str){
            try {
                str = JSON.parse(str);
            } catch (e) {
                return false;
            }
            return str;
        }
    },
    // 递归创建目录 同步方法
    mkdir:function(dirname) {
        console.log(dirname);
        if (fs.existsSync(dirname)) {
            return true;
        } else {
            if (helper.mkdir(path.dirname(dirname))) {
              fs.mkdirSync(dirname);
              return true;
            }
        }
    }
}
