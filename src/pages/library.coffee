# pages/library.coffee
# 图书馆页面解析

parser = (require '../parser').library
doubanQuery = (require '../query').douban

BasePageHandler = require './_base'


class RecommendHandler extends BasePageHandler

  inject: (bookMeta) ->
    ($ '#ctl00_ContentPlaceHolder1_titletb').val(bookMeta.title)
    ($ '#ctl00_ContentPlaceHolder1_authortb').val(bookMeta.author)
    ($ '#ctl00_ContentPlaceHolder1_isbntb').val(bookMeta.isbn)
    ($ '#ctl00_ContentPlaceHolder1_publisherb').val(bookMeta.publisher)
    ($ '#ctl00_ContentPlaceHolder1_publishdatetb').val(bookMeta.publishYear)

  handle: ->
    doubanBookId = parser.parseDoubanReference()
    return if not doubanBookId

    doubanQuery.queryItem(doubanBookId)
      .fail(@inject)


module.exports =
  recommend: new RecommendHandler
