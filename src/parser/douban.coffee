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
  parseSearchPage: (content) ->
    $input = ($ '#inp-query', content)
    return $input.val()

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
  parseListPage: (content) ->
    return (@parseDouListItem $i for $i in ($ '.doulist_item', content))
