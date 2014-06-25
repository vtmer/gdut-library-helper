var helper = helper || {};

// library reader recommend
helper.pages.readerrecommend = function() {
    var book = /douban_ref=(.*)+/.exec(document.URL);

    if (!book) {
        return;
    }

    GM_xmlhttpRequest({
        method: 'GET',
        url: book[1],
        onload: function(resp) {
            var book_meta;

            if (resp.status !== 200) {
                return;
            }
    
            /* FIXME I don't know why $('#wrapper', resp.responseText)
             *       not work here
             */
            book_meta = helper.parser.book_meta(
                $(resp.responseText).filter('div#wrapper')
            );

            $('#ctl00_ContentPlaceHolder1_titletb').val(
                book_meta.title
            );
            $('#ctl00_ContentPlaceHolder1_isbntb').val(
                book_meta.isbn
            );
            $('#ctl00_ContentPlaceHolder1_publishertb').val(
                book_meta.publisher
            );
            $('#ctl00_ContentPlaceHolder1_publishdatetb').val(
                book_meta.publish_time
            );
        }
    });
};


