#!/usr/bin/env node
var fs = require("fs"),
    path = require("path");
var program = require("commander");

program
  .version('0.0.1')
  .usage('[options] <url ...> : download the url')
  .option('--author', 'author');

program.parse(process.argv);
const app = require(path.resolve(__dirname,"../app/index"));

if(program.author){
    console.log("\n\n sunguide@qq.com")
    return;
}


console.log("\n\n enter webpage url, start fetch your likes !\n\n")
