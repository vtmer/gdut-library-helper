`
// ==UserScript==
// @name       GDUT library helper
// @namespace  http://library.gdut.edu.cn
// @version    0.4.0
// @description  Show the available books amount in GDUT library.
// @match      http://book.douban.com/*
// @match      http://222.200.98.171:81/*
// @match      http://www.baidu.com/*
// @copyright  2012, Link, hbc
// @require http://cdn.staticfile.org/jquery/2.1.1-rc2/jquery.min.js
// @require http://isbn.jpn.org/js/isbn.js
// @require http://isbn.jpn.org/js/isbn-groups.js
// @grant GM_xmlhttpRequest
// ==/UserScript==
`

# 助手开始执行
(require './helper').dispatch()
