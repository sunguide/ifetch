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
        if(html){
            let $ = cheerio.load(html.text);
            console.log(html.text);
            let links = $("link");
            let imgs = $("img");
            let javascripts = $("script");
            let sources = $("source");

            if(links.length > 0){
                $(links).each(function(i,link){
                    console.log($(link).attr("href"));
                    app.download($(link).attr("href")+"?ddd=sdfsdf#ddsdf");
                });
            }
            if(imgs.length > 0){
                $(imgs).each(function(i,img){
                    console.log($(img).attr("src"));
                    app.download($(img).attr("src"));
                });
            }
            console.log(javascripts.length);
            if(javascripts.length > 0){
                $(javascripts).each(function(i,javascript){
                    console.log($(javascript).attr("src"));
                    app.download($(javascript).attr("src"));
                });
            }

            if(sources.length > 0){
                $(sources).each(function(i,source){
                    console.log($(source).attr("src"));
                    app.download($(source).attr("src"));
                });
            }
        }

    }

    static async download(url){
        if(!url){
            return;
        }
        let dirname = app.getDownloadDir(url);
        console.log(dirname);
        console.log(app.getDownloadDir());
        helper.mkdir(dirname);
        let filePath = path.join(dirname, app.getDownloadFilename(url));
        request.get(url).pipe(fs.createWriteStream(filePath));
    }
    static getDownloadFilename(url){
        return path.basename(URL.parse(url).pathname);
    }
    static getDownloadDir(url){
        if(!url){
            url = fetch_url;
        }
        let dirname = path.resolve(__dirname, "../dowloads/"+domain);
        if(URL.parse(url).hostname == domain){
            dirname = path.join(dirname,path.dirname(URL.parse(url).pathname));
        }else{
            dirname = path.join(dirname,URL.parse(url).hostname);
            dirname = path.join(dirname,path.dirname(URL.parse(url).pathname));
        }
        return dirname;
    }

}
module.exports = app;
