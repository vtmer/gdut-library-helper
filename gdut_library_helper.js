// ==UserScript==
// @name       GDUT library helper
// @namespace  http://library.gdut.edu.cn
// @version    0.0.1
// @description  Show the available books amount in GDUT library.
// @match      http://book.douban.com/*
// @copyright  2012-2013, Link, hbc
// @require http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.8.3.min.js
// @require http://isbn.jpn.org/js/isbn.js
// @require http://isbn.jpn.org/js/isbn-groups.js
// ==/UserScript==
// @grant GM_xmlhttpRequest

var helper = {
    url: 'http://222.200.98.171:81/',
    book: {},
    parser: {},
    query: {},
    utils: {},
    tmpl: {},
    init: {},
    kick: {}
};
/* utils */
// Origin code from Bean vine: userscripts.org/scripts/review/49911
helper.utils.gb2312 = function(keyword) {
    GM_xmlhttpRequest({
        method: 'GET',
        url: 'http://www.baidu.com/s?ie=utf-8&wd=' + encodeURIComponent(keyword),
        overrideMimeType: 'text/xml; charset=gb2312',
        onload: function(resp){
            if (resp.status < 200 || resp.status > 300) {
                return;
            };
            var keywordGB = String(resp.responseText.match(/word=[^'"&]+['"&]/i)).replace(/word=|['"&]/ig,'');
            helper.query(keywordGB);
            //helper.book.name = keywordGB;
            //不知道为什么，我用上面那句的时候，执行query()时helper.book.name就变成undefined了。
        },
        onerror: function(){
            return;
        }
    });
};

// Origin code from isbn.jpn.org
helper.utils.convertIsbn = function(isbn, length){
    var result = [ ];
    isbn = ISBN.parse(isbn);
    if(length == 10){
        result.push(isbn.asIsbn10(true));
    }
    else if(length == 13){
        result.push(isbn.asIsbn13(true));
    }
    return result;
};

/* Origin code from John Resig's post
 * http://ejohn.org/blog/javascript-micro-templating/
 *
 * But I removed the cache implement as it will not affect
 * the efficiency obviously.
 */
helper.utils.tmpl = function(str, data) {
    var fn = new Function("obj",
        "var p=[],PRINT=function(){p.push.apply(p,arguments);};" +

        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +
        
        // Convert the template into pure JavaScript
        str
         .replace(/[\r\t\n]/g, " ")
         .split("<%").join("\t")
         .replace(/((^|%>)[^\t]*)'/g, "$1\r")
         .replace(/\t=(.*?)%>/g, "',$1,'")
         .split("\t").join("');")
         .split("%>").join("p.push('")
         .split("\r").join("\\'")
    + "');}return p.join('');");
    return fn(data);
};

/* templating */

helper.tmpl.result = function(buffer) {
    return helper.utils.tmpl(
        '<span class="pl">GDUT:</span> <%=content%><br />',
         {content: buffer}
    );
};

helper.tmpl.link = function(url, content) {
    return helper.utils.tmpl(
        '&nbsp;<a target="_blank" href=<%=url%>><%=content%></a>',
        {url: url, content: content}
    );
};

helper.tmpl.query = function(name) {
    return helper.url + 'searchresult.aspx?dp=50&title_f=' + name;
}

helper.tmpl.book = function(ctrlno) {
    return helper.url + 'bookinfo.aspx?ctrlno=' + ctrlno;
}

/* parser */

helper.parser.book = function() {

    var publisher = /出版社: (.*)/.exec($('#info').text());
    if (publisher !== null)
        publisher = publisher[1].trim();
    var isbn = /ISBN: (.*)/.exec($('#info').text());
    if(isbn !== null)
        isbn = isbn[1].trim();
    
    helper.utils.gb2312($('#wrapper h1 span').text());
    helper.book.publisher = publisher;
    helper.book.isbn10 = helper.utils.convertIsbn(isbn,10);
    helper.book.isbn13 = helper.utils.convertIsbn(isbn,13);
};

helper.parser.result = function(buffer) {
    var c = $(buffer).children();
    if (c.length < 9)
        return null;

    return {
        name: $(c[1]).text().trim(),
        ctrlno: $('input', c[0]).attr('value').trim(),
        author: $(c[2]).text().trim(),
        publisher: $(c[3]).text().trim(),
        total: parseInt($(c[6]).text().trim()),
        remains: parseInt($(c[7]).text().trim())
    };
};

/* main */

helper.query = function(name) {
    var query_url = helper.tmpl.query(name);
    GM_xmlhttpRequest({
        method: 'GET',
        url: query_url,
        onload: function(resp) {
            var html = resp.responseText;
            var info = $('#info');
            var tmpl;

            var not_found = $('#searchnotfound', html);
            if (not_found.length === 0) {
                /* found the books */
                var total = 0;
                var remains = 0;
                var results = $('tr', html);
                var r;
                var result_url;
                for (var i = 0;i < results.length;i ++) {
                    r = helper.parser.result(results[i]);
                    /* TODO improve matching accuracy */
                    if (r !== null && r.publisher === helper.book.publisher) {
                        total += r.total;
                        remains += r.remains;
                        result_url = helper.tmpl.book(r.ctrlno);
                        break;
                    }
                }

                if (total == 0 && remains == 0)
                    tmpl = helper.tmpl.result(
                            helper.tmpl.link(query_url, '没有找到一模一样的哦')
                           );
                else
                    tmpl = helper.tmpl.result(
                            helper.tmpl.link(result_url, '还剩' + remains + '本')
                           );
            } else {
                tmpl = helper.tmpl.result(
                        helper.tmpl.link(query_url, '没有找到哦')
                       );
            }

            info.append(tmpl);
        }
    });
};

helper.init = function() {
    helper.parser.book();
};

helper.kick = function() {
    helper.init();
}

/* kick off */
helper.kick();
