var helper = helper || {};

// /subject/xxx
helper.pages.subject = function() {
    var inject = function(result) {
        var r = function(buffer) {
            return helper.utils.tmpl(
                ' | <a href="{{ url }}readerrecommend.aspx' +
                '?douban_ref={{ href }}">去荐购</a>',
                {href: buffer, url: helper.url}
            );
        };
        var t = function(buffer) {
            return helper.utils.tmpl(
                '<span class="pl">GDUT:</span> {{ content }}<br />',
                 {content: buffer}
            );
        };
        var l = function(url, content) {
            return helper.utils.tmpl(
                '&nbsp;<a target="_blank" href={{url}}>{{content}}</a>',
                {url: url, content: content}
            );
        };
        var p = function(location) {
            return helper.utils.tmpl(
                ' 在 {{ location }}',
                {location: location}
            );
        };

        var info = $('#info');
        var tmpl = '';

        if (result.foundc <= 0) {
            tmpl = t(l(result.url, '没有找到哦') + r(document.URL));
        } else {
            if (result.total === 0 && result.remains === 0) {
                tmpl = t(l(result.url, '找到 ' + result.foundc + ' 本类似的'));
            } else {
                tmpl = t(l(result.url, '还剩 ' + result.remains + ' 本'));
            }
            if (result.location) {
                tmpl += p(result.location);
            }

            result.view += 1;
            helper.utils.cache(result.id, result);
        }
        info.append(tmpl);
    };

    var publisher_cmp = function(result, meta) {
        return (result.publisher === meta.publisher);
    };

    var book = helper.parser.book_meta($(document));

    var query_title = function() {
        var dfd = new $.Deferred();

        var fn = helper.utils.query_factory('title_f', book, publisher_cmp);
        helper.utils.gb2312(book.title).then(function(gb2312_title) {
            fn(gb2312_title).then(inject).fail(dfd.reject);
        }).fail(dfd.reject);

        return dfd.promise();
    };
    var query_isbn = function() {
        var dfd = new $.Deferred();

        var fn = helper.utils.query_factory('isbn_f', book, publisher_cmp);
        fn(book.isbn13).fail(function() {
            fn(book.isbn10).then(inject).fail(dfd.reject);
        }).then(inject);

        return dfd.promise();
    };
    var query_cache = function() {
        var dfd = new $.Deferred();

        cache = helper.utils.cache(book.id);
        if (!cache || cache.view > helper.refresh) {
            dfd.reject(cache);
        } else {
            inject(cache);
            dfd.resolve(cache);
        }

        return dfd.promise();
    };

    query_cache().fail(function() {
        query_isbn().fail(function() {
            query_title().fail(inject);
        });
    });
};
