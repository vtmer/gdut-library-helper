var helper = helper || {};

// /doulist/xxx
// `0.4.0` 加入
helper.pages.doulist = function() {
    var inject = function(book, result) {
        var tmpl = '<br />';

        var t = function(buffer) {
            return helper.utils.tmpl(
                '还剩 {{ remains }} 本',
                {remains: buffer}
            );
        };
        var l = function(url, content) {
            return helper.utils.tmpl(
                'GDUT: <a target="_blank" href={{url}}>{{content}}</a><br />',
                {url: url, content: content}
            );
        };
        var p = function(buffer) {
            return helper.utils.tmpl(
                '地点: 在 {{ location }} <br />',
                {location: buffer}
            );
        };

        if (result.foundc > 0) {
            if (result.total || result.remains) {
                tmpl += l(result.url, t(result.remains));

                if (result.location) {
                    tmpl += p(result.location);
                }

                helper.utils.cache(book.id, result);
            }
        }

        $('p.pl', book._context).append(tmpl);
    };

    var publisher_cmp = function(result, meta) {
        return (result.publisher === meta.publisher);
    };

    var books = helper.parser.doulist($('html'));

    var query_title = function(book) {
        var dfd = new $.Deferred();

        var dfd_reject = function(stuff) {
            dfd.reject(book);
        };

        var fn = helper.utils.query_factory('title_f', book, publisher_cmp);
        helper.utils.gb2312(book.title).then(function(gb2312_title) {
            fn(gb2312_title)
            .then(function(result) {
                inject(book, result);
            })
            .fail(dfd_reject);
        }).fail(dfd_reject);

        return dfd.promise();
    };

    var query_cache = function(book) {
        var dfd = new $.Deferred();

        cache = helper.utils.cache(book.id);
        if (!cache || cache.view > helper.refresh) {
            dfd.reject(book);
        } else {
            inject(book, cache);
            dfd.resolve(cache);
        }

        return dfd.promise();
    };

    for (var i = 0;i < books.length;i++) {
        query_cache(books[i])
            .fail(query_title);
    }
};
