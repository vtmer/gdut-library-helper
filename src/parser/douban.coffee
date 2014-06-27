# parser/douban.coffee
# Douban 页面解析

utils = require '../utils'


R_BOOK_ID = /subject\/(\d+)/
R_ISBN = /ISBN:\s*(.*)/
R_AUTHOR = /作者:\s*(.*)/
R_PUBLISHER = /出版社:\s*(.*)/
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
  parseSearchPage: ->
    $input = ($ '#inp-query')
    return $input.val()
