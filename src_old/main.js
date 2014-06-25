// ==UserScript==
// @name       GDUT library helper
// @namespace  http://library.gdut.edu.cn
// @version    0.4.0
// @description  Show the available books amount in GDUT library.
// @match      http://book.douban.com/*
// @match      http://222.200.98.171:81/*
// @match      http://www.baidu.com/*
// @copyright  2012-2013, Link, hbc
// @require http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.8.3.min.js
// @require http://isbn.jpn.org/js/isbn.js
// @require http://isbn.jpn.org/js/isbn-groups.js
// ==/UserScript==
// @grant GM_xmlhttpRequest

var helper = {
    pages: {
        subject: {},
        subject_search: {},
        readerrecommend: {}
    },
    
    url: 'http://222.200.98.171:81/',
    refresh: 5,
    utils: {},
    tmpl: {},
    parser: {},

    /**
     * kick
     *
     * 程序入口，根据当前 `url` 来分发操作。
     */
    kick: {}
};
