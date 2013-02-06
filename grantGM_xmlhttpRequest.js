var GM_xmlhttpRequest = function(settings) {
    var jqxhr = $.ajax(settings)
        .done(function(resp) {
            settings.onload(jqxhr);
        })
        .fail(function(resp) {
            settings.onerror(jqxhr);
        });
    return jqxhr;
};
