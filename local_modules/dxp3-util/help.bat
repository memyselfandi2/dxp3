@echo off
Mode con cols=128 lines=32
node ./index.js -help | more
@pause