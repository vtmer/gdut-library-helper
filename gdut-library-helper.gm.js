(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
  libraryBaseUrl: 'http://222.200.98.171:81',
  localCacheLife: 5,
  localCacheKeyPrefix: 'gdut_library_helper_'
};

},{}],2:[function(require,module,exports){
var helper, pages, utils;

utils = require('./utils');

pages = require('./pages');

module.exports = helper = {
  options: {
    libraryUrl: 'http://222.200.98.171:81',
    localCacheLife: 5
  },
  dispatch: function() {
    var matched, pageName;
    matched = /[com, 81]\/([\w]+)\/*/.exec(document.URL);
    pageName = matched === null ? 'index' : matched[1].trim();
    utils.log("Processing " + pageName + ".");
    switch (pageName) {
      case 'subject':
        return this.page.doubanBookItem();
      case 'subject_search':
        return this.page.doubanBooksSearch();
      case 'doulist':
        return this.page.doubanBooksList();
      case 'readerrecommend':
        return this.page.libraryReaderRecommend();
      default:
        return utils.errLog("Unable to find page handler for " + pageName + ".");
    }
  },
  page: {
    doubanBookItem: function() {
      return pages.douban.item.handle();
    },
    doubanBooksSearch: function() {
      return pages.douban.search.handle();
    },
    doubanBooksList: function() {
      return pages.douban.list.handle();
    },
    libraryReaderRecommend: function() {
      return pages.library.recommend.handle();
    }
  }
};

},{"./pages":6,"./utils":18}],3:[function(require,module,exports){

// ==UserScript==
// @name       GDUT library helper
// @namespace  http://library.gdut.edu.cn
// @version    0.4.0
// @description  Show the available books amount in GDUT library.
// @match      http://book.douban.com/*
// @match      http://222.200.98.171:81/*
// @match      http://www.baidu.com/*
// @copyright  2012, Link, hbc
// @require http://cdn.staticfile.org/jquery/2.1.1-rc2/jquery.min.js
// @require http://isbn.jpn.org/js/isbn.js
// @require http://isbn.jpn.org/js/isbn-groups.js
// @grant GM_xmlhttpRequest
// ==/UserScript==
;
(require('./helper')).dispatch();

},{"./helper":2}],4:[function(require,module,exports){
var BasePageHandler;

BasePageHandler = (function() {
  function BasePageHandler() {}

  BasePageHandler.prototype.handle = function() {};

  BasePageHandler.prototype.inject = function() {};

  return BasePageHandler;

})();

module.exports = BasePageHandler;

},{}],5:[function(require,module,exports){
var BasePageHandler, BookItemHandler, SearchHandler, parser, query, templates, utils,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

utils = require('../utils');

query = require('../query');

parser = (require('../parser')).douban;

templates = (require('../templates')).douban;

BasePageHandler = require('./_base');

BookItemHandler = (function(_super) {
  __extends(BookItemHandler, _super);

  function BookItemHandler() {
    return BookItemHandler.__super__.constructor.apply(this, arguments);
  }

  BookItemHandler.prototype.itemKey = function(bookMeta) {
    return "douban_" + bookMeta.id;
  };

  BookItemHandler.prototype.inject = function(bookInfos, bookMeta) {
    ($('#info')).append(templates.subject.bookInfos(bookInfos));
    if (bookInfos._viewTimes == null) {
      bookInfos._viewTimes = 0;
    }
    bookInfos._viewTimes = bookInfos._viewTimes + 1;
    return utils.cache.write(this.itemKey(bookMeta), bookInfos);
  };

  BookItemHandler.prototype.injectFail = function(bookInfos, bookMeta) {
    var $info;
    $info = $('#info');
    if (!bookInfos) {
      return $info.append(templates.subject.notFound(bookMeta));
    } else {
      return $info.append(templates.subject.foundMultiple(bookInfos));
    }
  };

  BookItemHandler.prototype.handle = function() {
    var bookMeta;
    bookMeta = parser.parseBookItemPage($('body'));
    return query.local.bookId(this.itemKey(bookMeta)).then(function() {
      return query.library.isbn(bookMeta);
    }).then(function() {
      return query.library.title(bookMeta);
    }).then((function(_this) {
      return function(bookInfos) {
        return _this.injectFail(bookInfos, bookMeta);
      };
    })(this)).fail((function(_this) {
      return function(bookInfos) {
        return _this.inject(bookInfos, bookMeta);
      };
    })(this));
  };

  return BookItemHandler;

})(BasePageHandler);

SearchHandler = (function(_super) {
  __extends(SearchHandler, _super);

  function SearchHandler() {
    return SearchHandler.__super__.constructor.apply(this, arguments);
  }

  SearchHandler.prototype.inject = function(infos) {
    var tmpl;
    if (!infos) {
      tmpl = templates.subjectSearch.notFound();
    } else {
      tmpl = templates.subjectSearch.result(infos);
    }
    return $(tmpl).insertBefore($('#content .aside .mb20'));
  };

  SearchHandler.prototype.handle = function() {
    var keyword;
    keyword = parser.parseSearchPage();
    return query.library.keyword(keyword).always(this.inject);
  };

  return SearchHandler;

})(BasePageHandler);

module.exports = {
  item: new BookItemHandler,
  search: new SearchHandler
};

},{"../parser":9,"../query":12,"../templates":16,"../utils":18,"./_base":4}],6:[function(require,module,exports){
module.exports = {
  douban: require('./douban'),
  library: require('./library')
};

},{"./douban":5,"./library":7}],7:[function(require,module,exports){
var BasePageHandler, RecommendHandler, doubanQuery, parser,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

parser = (require('../parser')).library;

doubanQuery = (require('../query')).douban;

BasePageHandler = require('./_base');

RecommendHandler = (function(_super) {
  __extends(RecommendHandler, _super);

  function RecommendHandler() {
    return RecommendHandler.__super__.constructor.apply(this, arguments);
  }

  RecommendHandler.prototype.inject = function(bookMeta) {
    ($('#ctl00_ContentPlaceHolder1_titletb')).val(bookMeta.title);
    ($('#ctl00_ContentPlaceHolder1_authortb')).val(bookMeta.author);
    ($('#ctl00_ContentPlaceHolder1_isbntb')).val(bookMeta.isbn);
    ($('#ctl00_ContentPlaceHolder1_publisherb')).val(bookMeta.publisher);
    return ($('#ctl00_ContentPlaceHolder1_publishdatetb')).val(bookMeta.publishYear);
  };

  RecommendHandler.prototype.handle = function() {
    var doubanBookId;
    doubanBookId = parser.parseDoubanReference();
    if (!doubanBookId) {
      return;
    }
    return doubanQuery.queryItem(doubanBookId).fail(this.inject);
  };

  return RecommendHandler;

})(BasePageHandler);

module.exports = {
  recommend: new RecommendHandler
};

},{"../parser":9,"../query":12,"./_base":4}],8:[function(require,module,exports){
var R_AUTHOR, R_BOOK_ID, R_ISBN, R_PUBLISHER, R_PUBLISH_YEAR, matchFirstOrNull, utils;

utils = require('../utils');

R_BOOK_ID = /subject\/(\d+)/;

R_ISBN = /ISBN:\s*(.*)/;

R_AUTHOR = /作者:\s*(.*)/;

R_PUBLISHER = /出版社:\s*(.*)/;

R_PUBLISH_YEAR = /出版年:\s*(.*)/;

matchFirstOrNull = function(pattern, haystack) {
  var rv;
  rv = pattern.exec(haystack);
  if (rv !== null) {
    rv = rv[1].trim();
  }
  return rv;
};

module.exports = {
  parseBookItemPage: function(content) {
    var bookInfoContent, bookMeta, isbn, m;
    bookInfoContent = ($('#info', content)).text();
    m = function(pattern) {
      return matchFirstOrNull(pattern, bookInfoContent);
    };
    isbn = m(R_ISBN);
    bookMeta = {
      id: matchFirstOrNull(R_BOOK_ID, location.href),
      title: $('h1 span', content).text().trim(),
      author: m(R_AUTHOR),
      publisher: m(R_PUBLISHER),
      publishYear: m(R_PUBLISH_YEAR),
      isbn: isbn,
      isbn10: utils.convertISBN(isbn, 10),
      isbn13: utils.convertISBN(isbn, 13)
    };
    return bookMeta;
  },
  parseSearchPage: function() {
    var $input;
    $input = $('#inp-query');
    return $input.val();
  }
};

},{"../utils":18}],9:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"./douban":8,"./library":10}],10:[function(require,module,exports){
var templates, utils;

utils = require('../utils');

templates = (require('../templates')).library;

module.exports = {
  parseQueryResult: function($content) {
    var $cols, bookInfos, ctrlno, getColText, i;
    $cols = (function() {
      var _i, _len, _ref, _results;
      _ref = $content.children;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        i = _ref[_i];
        _results.push($(i));
      }
      return _results;
    })();
    if ($cols.length < 9) {
      return;
    }
    getColText = function(idx) {
      return $cols[idx].text().trim();
    };
    ctrlno = $('input', $cols[0]).attr('value').trim();
    bookInfos = {
      title: getColText(1),
      ctrlno: ctrlno,
      author: getColText(2),
      publisher: getColText(3),
      location: getColText(5),
      url: templates.bookUrl(ctrlno),
      remains: parseInt(getColText(7), 10),
      total: parseInt(getColText(6), 10)
    };
    return bookInfos;
  },
  parseQueryResults: function(rawContent) {
    var $page, content, result;
    content = utils.clean(rawContent);
    $page = function(selector) {
      return $(selector, content);
    };
    if ($page('#searchnotfound').length !== 0) {
      return;
    }
    return (function() {
      var _i, _len, _ref, _results;
      _ref = $page('tbody tr');
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        result = _ref[_i];
        _results.push(this.parseQueryResult(result));
      }
      return _results;
    }).call(this);
  },
  parseDoubanReference: function() {
    var bookId;
    bookId = /douban_ref=(.*)/.exec(document.URL);
    if (bookId) {
      return bookId[1];
    }
  }
};

},{"../templates":16,"../utils":18}],11:[function(require,module,exports){
var parser, templates, utils;

utils = require('../utils');

parser = (require('../parser')).douban;

templates = (require('../templates')).douban;

module.exports = {
  queryItem: function(bookId) {
    var dfd;
    dfd = new $.Deferred;
    GM_xmlhttpRequest({
      method: 'GET',
      url: templates.queryItem(bookId),
      onload: function(resp) {
        var bookMeta, content;
        if (resp.status !== 200) {
          dfd.resolve;
          return;
        }
        content = utils.clean(resp.responseText);
        bookMeta = parser.parseBookItemPage($(content).filter('div#wrapper'));
        return dfd.reject(bookMeta);
      }
    });
    return dfd.promise();
  }
};

},{"../parser":9,"../templates":16,"../utils":18}],12:[function(require,module,exports){
module.exports = {
  douban: require('./douban'),
  library: require('./library'),
  local: require('./local')
};

},{"./douban":11,"./library":13,"./local":14}],13:[function(require,module,exports){
var parser, publisherFilterFactory, queryFactory, templates, utils;

parser = (require('../parser')).library;

templates = (require('../templates')).library;

utils = require('../utils');

queryFactory = function(queryUrlBuilder, filter) {
  return function(queryValue) {
    var dfd, queryUrl;
    dfd = new $.Deferred;
    queryUrl = queryUrlBuilder(queryValue);
    GM_xmlhttpRequest({
      method: 'GET',
      url: queryUrl,
      onload: function(resp) {
        var parsedResults, result;
        parsedResults = parser.parseQueryResults(resp.responseText);
        if (!parsedResults) {
          dfd.resolve(parsedResults);
          return;
        }
        result = filter(queryValue, parsedResults);
        if (result) {
          return dfd.reject(result);
        } else {
          return dfd.resolve({
            queryUrl: queryUrl,
            results: parsedResults
          });
        }
      }
    });
    return dfd.promise();
  };
};

publisherFilterFactory = function(bookMeta) {
  return function(value, results) {
    var result, _i, _len;
    for (_i = 0, _len = results.length; _i < _len; _i++) {
      result = results[_i];
      if (result.publisher === bookMeta.publisher) {
        return result;
      }
    }
    return null;
  };
};

module.exports = {
  keyword: function(keyword) {
    var dfd, keywordQuery;
    dfd = new $.Deferred;
    keywordQuery = queryFactory(templates.queryKeywordURLBuilder, function() {
      return null;
    });
    utils.convertGB2312(keyword).then(keywordQuery).always(dfd.resolve);
    return dfd.promise();
  },
  title: function(bookMeta) {
    var dfd, titleQuery;
    dfd = new $.Deferred;
    titleQuery = queryFactory(templates.queryTitleURLBuilder, publisherFilterFactory(bookMeta));
    utils.convertGB2312(bookMeta.title).then(titleQuery).then(dfd.resolve).fail(dfd.reject);
    return dfd.promise();
  },
  isbn: function(bookMeta) {
    var dfd, isbnQuery;
    dfd = new $.Deferred;
    isbnQuery = queryFactory(templates.queryISBNURLBuilder, publisherFilterFactory(bookMeta));
    isbnQuery(bookMeta.isbn10).then(function() {
      return isbnQuery(bookMeta.isbn13);
    }).then(dfd.resolve).fail(dfd.reject);
    return dfd.promise();
  }
};

},{"../parser":9,"../templates":16,"../utils":18}],14:[function(require,module,exports){
var config, utils;

utils = require('../utils');

config = require('../config');

module.exports = {
  bookId: function(id) {
    var bookInfos, dfd;
    dfd = new $.Deferred;
    bookInfos = utils.cache.read(id);
    if (bookInfos === null) {
      utils.errLog("" + id + " not found from cache.");
      dfd.resolve(bookInfos);
    } else {
      if (bookInfos._viewTimes == null) {
        bookInfos._viewTimes = 0;
      }
      if (bookInfos._viewTimes > config.localCacheLife) {
        utils.errLog("" + id + " hits too many times from cache, throw it.");
        dfd.resolve(bookInfos);
      } else {
        utils.log("Found " + id + " from cache.");
        dfd.reject(bookInfos);
      }
    }
    return dfd.promise();
  }
};

},{"../config":1,"../utils":18}],15:[function(require,module,exports){
var libraryTmpl;

libraryTmpl = require('./library');

module.exports = {
  subject: {
    bookInfos: function(infos) {
      return "<span class=\"pl\">GDUT:</span> \n<a href=\"" + infos.url + "\" target=\"_blank\">还剩 " + infos.remains + " 本</a>\n<br />\n在 " + infos.location;
    },
    notFound: function(infos) {
      var recommendUrl;
      recommendUrl = libraryTmpl.recommendUrl(infos);
      return "<span class=\"pl\">GDUT:</span> \n没有找到噢，<a href=\"" + recommendUrl + "\" target=\"_blank\">去荐购</a>";
    },
    foundMultiple: function(infos) {
      return "<span class=\"pl\">GDUT:</span> \n<a href=\"" + infos.queryUrl + "\" target=\"_blank\">找到 " + infos.results.length + " 本类似的</a>";
    }
  },
  subjectSearch: {
    result: function(infos) {
      return "<div class=\"mb20\">\n  <div class=\"hd\">\n    <h2>在广工图书馆&nbsp;·&nbsp;·&nbsp;·</h2>\n  </div>\n  <div class=\"bd\">\n    <p class=\"pl\">\n      <a href=\"" + infos.queryUrl + "\" target=\"_blank\">\n        找到 " + infos.results.length + " 本类似的\n      </a>\n    </p>\n  </div>\n</div>";
    },
    notFound: function() {
      return "<div class=\"mb20\">\n  <div class=\"hd\">\n    <h2>在广工图书馆&nbsp;·&nbsp;·&nbsp;·</h2>\n  </div>\n  <div class=\"bd\">\n    <p class=\"pl\">没有找到噢</p>\n  </div>\n</div>";
    }
  },
  queryItem: function(bookId) {
    return "http://book.douban.com/subject/" + bookId + "/";
  }
};

},{"./library":17}],16:[function(require,module,exports){
module.exports = {
  library: require('./library'),
  douban: require('./douban')
};

},{"./douban":15,"./library":17}],17:[function(require,module,exports){
var config;

config = require('../config');

module.exports = {
  queryISBNURLBuilder: function(isbn) {
    return "" + config.libraryBaseUrl + "/searchresult.aspx?dp=50&isbn_f=" + isbn;
  },
  queryTitleURLBuilder: function(title) {
    return "" + config.libraryBaseUrl + "/searchresult.aspx?dp=50&title=" + title;
  },
  queryKeywordURLBuilder: function(keyword) {
    return "" + config.libraryBaseUrl + "/searchresult.aspx?dp=50&anywords=" + keyword;
  },
  bookUrl: function(ctrlno) {
    return "" + config.libraryBaseUrl + "/bookinfo.aspx?ctrlno=" + ctrlno;
  },
  recommendUrl: function(infos) {
    return "" + config.libraryBaseUrl + "/readerrecommend.aspx?douban_ref=" + infos.id;
  }
};

},{"../config":1}],18:[function(require,module,exports){
var config, utils;

config = require('./config');

module.exports = utils = {
  log: function(something) {
    return console.log(something);
  },
  errLog: function(something) {
    return console.error(something);
  },
  convertISBN: function(isbn, length) {
    var parsedISBN;
    parsedISBN = ISBN.parse(isbn);
    switch (length) {
      case 10:
        return parsedISBN.asIsbn10(true);
      case 13:
        return parsedISBN.asIsbn13(true);
    }
  },
  convertGB2312: function(keyword) {
    var dfd, encodedKeyword;
    dfd = new $.Deferred;
    encodedKeyword = encodeURIComponent(keyword);
    GM_xmlhttpRequest({
      method: 'GET',
      url: "http://www.baidu.com/s?ie=utf-8&wd=" + encodedKeyword,
      overrideMimeType: 'text/xml; charset=gb2312',
      onload: function(resp) {
        var gb2312Keyword;
        if (resp.status < 200 || resp.status > 300) {
          utils.errLog("Failed to convert " + keyword + " to gb2312.");
          dfd.reject(keyword);
          return;
        }
        gb2312Keyword = String(resp.responseText.match(/word=[^'"&]+['"&]/i)).replace(/word=|['"&]/ig, '');
        return dfd.resolve(gb2312Keyword);
      },
      onerror: function() {
        return utils.errLog("Failed to convert " + keyword + " to gb2312.");
      }
    });
    return dfd.promise();
  },
  cache: {
    read: function(key) {
      var item, realKey;
      realKey = "" + config.localCacheKeyPrefix + key;
      item = localStorage.getItem(realKey);
      return JSON.parse(localStorage.getItem(realKey));
    },
    write: function(key, value) {
      var realKey;
      realKey = "" + config.localCacheKeyPrefix + key;
      return localStorage.setItem(realKey, JSON.stringify(value));
    }
  },
  clean: function(content) {
    var pattern, tags, _i, _len;
    tags = [/<img.*>/gi, /<script.*>.*<\/script>/gi, /<link.*>.*<\/link>/gi, /<style.*>.*<\/style>/gi];
    for (_i = 0, _len = tags.length; _i < _len; _i++) {
      pattern = tags[_i];
      content = content.replace(pattern, '');
    }
    return content;
  }
};

},{"./config":1}]},{},[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18])