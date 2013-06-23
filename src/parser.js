var helper = helper || {};

/* parser */

/**
 * parser.result
 *
 * 解析查询结果 `table` 中的一个 `tr`
 */
helper.parser.result = function(buffer) {
    var c = $(buffer).children();
    if (c.length < 9) {
        return null;
    }

    return {
        name: $(c[1]).text().trim(),
        ctrlno: $('input', c[0]).attr('value').trim(),
        author: $(c[2]).text().trim(),
        publisher: $(c[3]).text().trim(),
        location: $(c[5]).text().trim(),
        total: parseInt($(c[6]).text().trim(), 10),
        remains: parseInt($(c[7]).text().trim(), 10)
    };
};

/**
 * parser.results
 *
 * 解析查询结果的 `table`
 *
 * @return object {
 *      remains:    剩余总本数
 *      total:      总本数
 *      foundc:     是否有找到，非 0 表示找到类似条目的数目
 *      url:        查询 url
 * }
 */
helper.parser.results = function(buffer, url, meta, cmp) {
    var ret = {
        remains: 0,
        total: 0,
        foundc: 0,
        location: '',
        url: url
    };

    var not_found = $('#searchnotfound', buffer);
    if (not_found.length === 0) {
        /* found the books */
        var r, i , len;
        var results = $('tbody tr', buffer);
        ret.foundc = $('#ctl00_ContentPlaceHolder1_countlbl', buffer).html();
        ret.foundc = parseInt(ret.foundc, 10);
        for (i = 0 , len =  results.length; i < len;i ++) {
            r = helper.parser.result(results[i]);
            if (r !== null && cmp(r, meta)) {
                ret.url = helper.tmpl.library_book_url(r.ctrlno);
                ret.remains += r.remains;
                ret.total += r.total;
                ret.location = r.location;
                break;
            }
        }
    }

    return ret;
};

helper.parser.book_meta = function(raw) {
    var publisher = /出版社: (.*)/.exec($('#info', raw).text());
    if (publisher !== null) {
        publisher = publisher[1].trim();
    }
    var isbn = /ISBN: (.*)/.exec($('#info', raw).text());
    if (isbn !== null) {
        isbn = isbn[1].trim();
    }
    var author = /作者: (.*)/.exec($('#info', raw).text());
    if (author !== null) {
        author = author[1].trim();
    }
    var publish_time = /出版年: (.*)/.exec($('#info', raw).text());
    if (publish_time !== null) {
        publish_time = publish_time[1].trim();
    }

    return {
        title: $('h1 span', raw).text(),
        author: author,
        publisher: publisher,
        publish_time: publish_time,
        isbn: isbn,
        isbn10: helper.utils.convertISBN(isbn, 10),
        isbn13: helper.utils.convertISBN(isbn, 13)
    };
};

