var helper = helper || {};

/* templating */

helper.tmpl.query_url = function(type, value) {
    return helper.utils.tmpl(
        helper.url + 'searchresult.aspx?dp=50&{{ type }}={{ value }}',
        {type: type, value: value}
    );
};

helper.tmpl.library_book_url= function(ctrlno) {
    return helper.url + 'bookinfo.aspx?ctrlno=' + ctrlno;
};
