# query/douban.coffee
# Douban 查询接口

utils = (require '../utils')
parser = (require '../parser').douban
templates = (require '../templates').douban


module.exports =

  # 根据豆瓣图书 id 查询
  queryItem: (bookId) ->
    dfd = new $.Deferred

    GM_xmlhttpRequest(
      method: 'GET'
      url: templates.queryItem(bookId)
      onload: (resp) ->
        if resp.status != 200
          dfd.resolve
          return

        content = utils.clean resp.responseText
        bookMeta = parser.parseBookItemPage $(content).filter('div#wrapper')

        dfd.reject bookMeta
    )

    return dfd.promise()
