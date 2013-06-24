var helper = helper || {};

helper.kick = function() {
    var type = /[com, 81]\/([\w]+)\/*/.exec(document.URL);
    type = (type !== null) ? (type[1].trim()) : ('index');

    /* dispatch */
    if (type === 'subject') {
        helper.pages.subject();
    } else if (type === 'subject_search') {
        helper.pages.subject_search();
    } else if (type === 'readerrecommend') {
        helper.pages.readerrecommend();
    } else if (type === 'doulist') {
        helper.pages.doulist();
    } else {
        console.log(type);
    }
};

helper.kick();
