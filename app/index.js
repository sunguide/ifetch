'use strict';
const path = require("path");
const helper = require(path.resolve(__dirname, "../lib/helper"));
const request = require(path.resolve(__dirname, "../lib/request"));
const cheerio = require('cheerio');
const URL = require("url");
const fs = require("fs");
let fetch_url;
let domain;//fetch url's domain
let url_path;
class app {
  static start() {
    try {
      app.fetch("https://shimo.im/index.html");
    } catch (err) {
      console.log(err);
    }
  }

  static async fetch(url) {
    fetch_url = url;
    domain = URL.parse(url).hostname;
    url_path = path.dirname(URL.parse(url).pathname);
    console.log(url_path)
    let html = await request.get(url);
    html = html.text;
    if (html) {
      let $ = cheerio.load(html);
      let links = $("link");
      let imgs = $("img");
      let javascripts = $("script");
      let sources = $("source");
      let downloadDir = app.getDownloadDir(url);

      if (links.length > 0) {
        $(links).each(async (i, link) => {
          let _url = $(link).attr("href");
          let absolutePath = await app.download(_url);
          console.log(absolutePath);
          let relativePath = app.getRelativePath(absolutePath, downloadDir);
          html = html.replace(_url, relativePath);
        });
      }
      if (imgs.length > 0) {
        $(imgs).each(async (i, img) => {
          let _url = $(img).attr("src");
          console.log(_url);
          let absolutePath = await app.download(_url);
          let relativePath = app.getRelativePath(absolutePath, downloadDir);
          html = html.replace(_url, relativePath);
        });
      }
      console.log(javascripts.length);
      if (javascripts.length > 0) {
        $(javascripts).each(async (i, javascript) => {
          let _url = $(javascript).attr("src");
          let absolutePath = await app.download(_url);
          let relativePath = app.getRelativePath(absolutePath, downloadDir)
          html = html.replace(_url, relativePath);
        });
      }

      if (sources.length > 0) {
        $(sources).each(async (i, source) => {
          let _url = $(source).attr("src");
          let relativePath = await app.download(_url);
          html = html.replace(_url, relativePath);
        });
      }
      setTimeout(() => {
        app.createFile(downloadDir + "/" + app.getDownloadFilename(url), html);
      }, 2000)
    }

  }

  static async download(url) {
    if (!url) {
      return "";
    }
    try {
      if (url.indexOf("//") === 0) {
        url = "http:" + url;
      } else if (null === URL.parse(url).hostname) {
        if (url.indexOf("/") === 0) {
          url = "http://" + domain + url_path + url;
        } else {
          url = "http://" + domain + url_path + "/" + url;
        }
      }
      let dirname = app.getDownloadDir(url);
      helper.mkdir(dirname);
      let filePath = path.join(dirname, app.getDownloadFilename(url));
      request.get(url).pipe(fs.createWriteStream(filePath));
      return filePath;
    } catch (err) {
      console.log(err);
    }

  }

  static getDownloadFilename(url) {
    let pathname = URL.parse(url).pathname;
    if (pathname) {
      if (pathname.substr(pathname.length - 1, 1) === "/") {
        return "index.html";
      } else if (pathname.indexOf(".") < 0) {
        return path.basename(pathname) + ".html";
      }
    }
    console.log(path.basename(pathname))
    return path.basename(pathname);
  }

  static getDownloadDir(url) {
    if (!url) {
      url = fetch_url;
    } else if (url.indexOf("//") === 0) {
      url = "http:" + url;
    }
    let dirname = path.resolve(__dirname, "../dowloads/" + domain);
    console.log(path.dirname(URL.parse(url).pathname));
    if (!URL.parse(url).hostname || URL.parse(url).hostname === domain) {
      dirname = path.join(dirname, path.dirname(URL.parse(url).pathname));
    } else {
      dirname = path.join(dirname, URL.parse(url).hostname);
      dirname = path.join(dirname, path.dirname(URL.parse(url).pathname));
    }
    return dirname;
  }

  static getRelativePath(filePath, currentPath) {
    let dirname = path.resolve(__dirname, "../dowloads/" + domain);

    if (currentPath) {
      dirname = currentPath;
    }

    if (!filePath) {
      return dirname;
    }
    return path.relative(currentPath, filePath)
  }

  static createFile(filePath, content) {
    helper.mkdir(path.dirname(filePath));
    // 写入数据, 文件不存在会自动创建
    fs.writeFile(filePath, content, function (err) {
      if (err) throw err;
    });
  }

}
module.exports = app;
