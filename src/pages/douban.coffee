# pages/douban.coffee
# Douban 页面解析

utils = (require '../utils')
query = (require '../query')
parser = (require '../parser').douban
templates = (require '../templates').douban

BasePageHandler = require './_base'


class BookItemHandler extends BasePageHandler

  itemKey: (bookMeta) ->
    "douban_#{bookMeta.id}"

  inject: (bookInfos, bookMeta) ->
    ($ '#info').append(templates.subject.bookInfos bookInfos)

    # 保存查询结果到缓存中
    if not bookInfos._viewTimes?
      bookInfos._viewTimes = 0
    bookInfos._viewTimes = bookInfos._viewTimes + 1
    utils.cache.write(@itemKey(bookMeta), bookInfos)

  injectFail: (bookInfos, bookMeta) ->
    $info = ($ '#info')
 
    if not bookInfos
      $info.append(templates.subject.notFound bookMeta)
    else
      $info.append(templates.subject.foundMultiple bookInfos)

  handle: ->
    bookMeta = parser.parseBookItemPage(($ 'body'))

    # 先尝试查询本地缓存
    query.local.bookId(@itemKey(bookMeta))
      # 查询失败，根据 isbn 查询
      .then(-> query.library.isbn(bookMeta))
      # 查询失败，根据标题查询
      .then(-> query.library.title(bookMeta))
      # 查询失败，显示失败信息
      .then((bookInfos) => @injectFail(bookInfos, bookMeta))
      # (任意一个) 查询成功，显示图书信息
      .fail((bookInfos) => @inject(bookInfos, bookMeta))


class SearchHandler extends BasePageHandler

  inject: (infos) ->
    if not infos
      tmpl = templates.subjectSearch.notFound()
    else
      tmpl = templates.subjectSearch.result infos

    $(tmpl).insertBefore($ '#content .aside .mb20')

  handle: ->
    keyword = parser.parseSearchPage()

    query.library.keyword(keyword)
      .always(@inject)


module.exports =
  item: new BookItemHandler
  search: new SearchHandler
