'use strict';
const path = require("path");
const helper = require(path.resolve(__dirname,"../lib/helper"));
const request = require(path.resolve(__dirname,"../lib/request"));
const cheerio = require('cheerio');
const URL = require("url");
const fs = require("fs");
let fetch_url;
let domain;//fetch url's domain
class app {
    static start(){
        try{
            app.fetch("https://shimo.im/index.html");
        }catch(err){
            console.log(err);
        }
    }
    static async fetch(url){
        fetch_url = url;
        domain = URL.parse(url).hostname;
        let html = await request.get(url);
        html = html.text;
        if(html){
            let $ = cheerio.load(html);
            let links = $("link");
            let imgs = $("img");
            let javascripts = $("script");
            let sources = $("source");

            if(links.length > 0){
                $(links).each(async (i,link) => {
                    let _url = $(link).attr("href");
                    console.log(_url)
                    let relativePath = await app.download(_url);
                    html.replace(_url, relativePath);
                    console.log(relativePath);
                });
            }
            if(imgs.length > 0){
                $(imgs).each(function(i,img){
                    let _url = $(img).attr("src");
                    console.log(_url);
                    let relativePath = app.download(_url);
                    html.replace(_url, relativePath);
                });
            }
            console.log(javascripts.length);
            if(javascripts.length > 0){
                $(javascripts).each(function(i,javascript){
                    let _url = $(javascript).attr("src");
                    let relativePath = app.download(_url);
                    html.replace(_url, relativePath);
                });
            }

            if(sources.length > 0){
                $(sources).each(function(i,source){
                    let _url = $(source).attr("src");
                    let relativePath = app.download(_url);
                    html.replace(_url, relativePath);
                });
            }
            app.createFile(app.getDownloadFilename(url), html);
        }

    }

    static async download(url){
        if(!url){
            return "";
        }
        try{
            let dirname = app.getDownloadDir(url);
            console.log(dirname);
            helper.mkdir(dirname);
            let filePath = path.join(dirname, app.getDownloadFilename(url));
            request.get(url).pipe(fs.createWriteStream(filePath));
            return app.getRelativePath(filePath);
        }catch(err){
            console.log(err);
        }

    }
    static getDownloadFilename(url){
        let pathname = URL.parse(url).pathname;
        if(pathname){
            if(pathname.substr(pathname.length - 1, 1) === "/"){
                return "index.html";
            }else if(pathname.indexOf(".") < 0){
                return path.basename(pathname) + ".html";
            }
        }
        return path.basename(pathname);
    }
    static getDownloadDir(url){
        if(!url){
            url = fetch_url;
        }
        let dirname = path.resolve(__dirname, "../dowloads/"+domain);
        if(URL.parse(url).hostname == domain){
            dirname = path.join(dirname,path.dirname(URL.parse(url).pathname));
        }else{
            dirname = path.join(dirname, URL.parse(url).hostname);
            dirname = path.join(dirname,path.dirname(URL.parse(url).pathname));
        }
        return dirname;
    }

    static getRelativePath(filePath){
        let dirname = path.resolve(__dirname, "../dowloads/"+domain);

        if(!filePath){
            return dirname;
        }
        return filePath.replace(dirname,"./")
    }

    static createFile(filePath, content){
        // 写入数据, 文件不存在会自动创建
        fs.writeFile(filePath, content, function (err) {
          if (err) throw err;
        });
    }

}
module.exports = app;
