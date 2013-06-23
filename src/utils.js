var helper = helper || {};

helper.utils = {};

// isbn converter
helper.utils.convertISBN = function(isbn, length) {
    var result = [ ];
    isbn = ISBN.parse(isbn);
    if(length === 10) {
        result.push(isbn.asIsbn10(true));
    }
    else if(length === 13) {
        result.push(isbn.asIsbn13(true));
    }
    return result;
};

/**
 * gb2312 convert
 *
 * 因为图书馆那边的中文查询不支持 utf-8，
 * 所以要先通过 baidu 将内容编码转换成 gb2312
 *
 * Origin code from Bean vine: userscripts.org/scripts/review/49911
 */
helper.utils.gb2312 = function(keyword) {
    var dfd = $.Deferred();

    GM_xmlhttpRequest({
        method: 'GET',
        url: 'http://www.baidu.com/s?ie=utf-8&wd=' +
                encodeURIComponent(keyword),
        overrideMimeType: 'text/xml; charset=gb2312',
        onload: function(resp) {
            if (resp.status < 200 || resp.status > 300) {
                return;
            }
            var keywordGB = String(
                resp.responseText.match(/word=[^'"&]+['"&]/i))
                                 .replace(/word=|['"&]/ig,'');
            /* it's gb2312 now */
            dfd.resolve(keywordGB);
        },
        onerror: function() {
            return;
        }
    });

    return dfd.promise();
};

/**
 * utils.tmpl
 *
 * 提供类似 mustache 的语法，只提供
 * 变量代换
 *
 * example: {{ name }}
 */
helper.utils.tmpl = function(str, data) {
    var re = /\{\{([\w ]+)\}\}/, ret = str;
    var r;

    while ((r = re.exec(ret)) !== null) {
        ret = ret.replace(r[0], data[r[1].trim()]);
    }

    return ret;
};

/**
 * utils.query_factory
 *
 * 查询方法的工厂函数。
 * 因为javascript 中 `xhr` 是异步操作，而一些逻辑是有先后顺序的，
 * 所以用 jquery 里的 `deferred` 对象来实现顺序调用。
 *
 * @param meta  查询书籍的基本信息（书名、出版社、 isbn）
 * @param cmp   用作比较当前书籍和图书馆查询结果
 */
helper.utils.query_factory = function(type, meta, cmp) {
    return function(value) {
        var dfd = new $.Deferred();
        var query_url = helper.tmpl.query_url(type, value);

        GM_xmlhttpRequest({
            method: 'GET',
            url: query_url,
            onload: function(resp) {
                var result = helper.parser.results(resp.responseText,
                                                   query_url, meta,
                                                   cmp);
                if (result.foundc) {
                    dfd.resolve(result);
                } else {
                    dfd.reject(result);
                }
            }
        });

        return dfd.promise();
    };
};
