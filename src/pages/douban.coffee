# pages/douban.coffee
# Douban 页面解析

utils = (require '../utils')
query = (require '../query')
parser = (require '../parser').douban
templates = (require '../templates').douban

BasePageHandler = require './_base'


class DoubanPageHandler extends BasePageHandler

  itemKey: (bookMeta) ->
    "douban_#{bookMeta.id}"


class BookItemHandler extends DoubanPageHandler

  inject: (bookInfos, bookMeta) ->
    ($ '#info').append(templates.subject.bookInfos bookInfos)

    # 保存查询结果到缓存中
    utils.cache.writeBookInfos(@itemKey(bookMeta), bookInfos)

  injectFail: (bookInfos, bookMeta) ->
    $info = ($ '#info')
 
    if bookInfos
      $info.append(templates.subject.foundMultiple bookInfos)
    else
      $info.append(templates.subject.notFound bookMeta)

  handle: ->
    bookMeta = parser.parseBookItemPage($ 'body')

    inject = (bookInfos) =>
      # 查询图书馆馆藏信息
      query.library.ctrlNo(bookInfos)
        .always((updatedBookInfos) => @inject(updatedBookInfos, bookMeta))

    # 先尝试查询本地缓存
    query.local.bookId(@itemKey(bookMeta))
      # 查询失败，根据 isbn 查询
      .then(-> query.library.isbn(bookMeta))
      # 查询失败，根据标题查询
      .then(-> query.library.title(bookMeta))
      # 查询失败，显示失败信息
      .then((bookInfos) => @injectFail(bookInfos, bookMeta))
      # (任意一个) 查询成功，显示图书信息
      .fail(inject)


class SearchHandler extends DoubanPageHandler

  inject: (infos) ->
    if infos
      tmpl = templates.subjectSearch.result infos
    else
      tmpl = templates.subjectSearch.notFound()

    $(tmpl).insertBefore($ '#content .aside .mb20')

  handle: ->
    keyword = parser.parseSearchPage($ 'body')

    query.library.keyword(keyword)
      .always(@inject)


class DouListHandler extends DoubanPageHandler

  inject: (bookInfos, bookMeta) ->
    return unless bookMeta.$item
    ($ 'p.pl', bookMeta.$item).append(templates.douList.bookInfos bookInfos)

    # 保存查询结果到缓存中
    utils.cache.writeBookInfos(@itemKey(bookMeta), bookInfos)

  handleBook: (bookMeta) ->
    # 先尝试本地缓存
    query.local.bookId(@itemKey(bookMeta))
      # 查询失败，根据标题查询
      .then(-> query.library.title(bookMeta))
      # (任意一个) 查询成功，显示图书信息
      .fail((bookInfos) => @inject(bookInfos, bookMeta))

  handle: ->
    @handleBook book for book in parser.parseListPage($ 'body')


module.exports =
  item: new BookItemHandler
  search: new SearchHandler
  list: new DouListHandler
