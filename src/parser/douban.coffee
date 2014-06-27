# parser/douban.coffee
# Douban 页面解析

utils = require '../utils'


R_BOOK_ID = /subject\/(\d+)/
R_ISBN = /ISBN:\s*(.*)/
R_AUTHOR = /作者\s*:\s*(.*)/
R_PUBLISHER = /出版社\s*:\s*(.*)/
R_PUBLISH_YEAR = /出版年:\s*(.*)/


matchFirstOrNull = (pattern, haystack) ->
  rv = pattern.exec haystack
  rv = rv[1].trim() unless rv is null
  return rv


module.exports =
  # 解析 http://book.douban.com/subject/xxxxxxx/
  # @return object
  #   id:           douban id
  #   title:        标题
  #   author:       作者
  #   publisher:    出版商
  #   publishYear:  出版年
  #   isbn:         原始 isbn
  #   isbn10:       10 位 isbn
  #   isbn13:       13 位 isbn
  parseBookItemPage: (content) ->
    bookInfoContent = ($ '#info', content).text()
    m = (pattern) -> matchFirstOrNull(pattern, bookInfoContent)

    isbn = m(R_ISBN)

    bookMeta = 
      id: matchFirstOrNull(R_BOOK_ID, location.href)
      title: $('h1 span', content).text().trim()
      author: m(R_AUTHOR)
      publisher: m(R_PUBLISHER)
      publishYear: m(R_PUBLISH_YEAR)
      isbn: isbn
      isbn10: utils.convertISBN(isbn, 10)
      isbn13: utils.convertISBN(isbn, 13)

    return bookMeta

  # 解析 http://book.douban.com/subject_search?search_text=xxxx
  # @return string 查询串
  parseSearchPage: (content) ->
    $input = ($ '#inp-query', content)
    return $input.val()

  # 解析 http://book.douban.com/doulist/xxxxx/ 中的单个条目
  # @return object
  #   id:         douban id
  #   title:      标题
  #   author:     作者
  #   publisher:  出版商
  #   $item:      对应 jquery dom 元素
  parseDouListItem: ($item) ->
    $link = ($ ($ '.pl2 a', $item)[1])
    content = ($ 'p.pl', $item).text()

    bookMeta =
      id: matchFirstOrNull(R_BOOK_ID, $link.attr('href'))
      title: $link.text().trim()
      author: matchFirstOrNull(R_AUTHOR, content)
      publisher: matchFirstOrNull(R_PUBLISHER, content)
      $item: $item

    return bookMeta

  # 解析 http://book.douban.com/doulist/xxxxx/
  # @return array 豆列条目信息 @see ``parseDouListItem``
  parseListPage: (content) ->
    return (@parseDouListItem $i for $i in ($ '.doulist_item', content))
