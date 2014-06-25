var helper = helper || {};

// /subject_search
helper.pages.subject_search = function() {
    var query_word = function() {
        return $('#inp-query').attr('value');
    };

    var inject = function(result) {
        var s = function(desc) {
            return helper.utils.tmpl(
                '<div class="mb20"><div class="hd">' +
                    '<h2>在广工图书馆&nbsp;·&nbsp;·&nbsp;·</h2>' +
                '</div>' +
                '<div class="bd"><p class="pl">{{desc}}</p></div>',
                {desc: desc}
            );
        };
        
        var l = function(url, content) {
            return helper.utils.tmpl(
                '&nbsp;<a target="_blank" href={{url}}>{{content}}</a>',
                {url: url, content: content}
            );
        };

        var r = $('#content .aside .mb20');
        var tmpl;

        if (result.foundc <= 0) {
            tmpl = s('没有找到哦');
        } else {
            tmpl = s(l(result.url, '找到 ' + result.foundc + ' 本类似的'));
        }
        $(tmpl).insertBefore(r);
 
    };

    var cmp = function(a, b) {return false;};

    var query_anywords = function() {
        var dfd = new $.Deferred();

        var fn = helper.utils.query_factory('anywords', null, cmp);
        helper.utils.gb2312(query_word()).then(function(name) {
            fn(name).then(inject).fail(dfd.reject);
        }).fail(dfd.reject);

        return dfd.promise();
    };

    query_anywords().fail(inject);
};

