# parser/library.coffee
# 图书馆页面解析

utils = require '../utils'
templates = (require '../templates').library


module.exports =

  # 解析 http://222.200.98.171:81/searchresult.aspx 返回的单条查询结果
  # @return object
  #   title:      标题
  #   ctrlno:     控制号
  #   author:     作者
  #   publisher:  出版商
  #   location:   馆藏位置编号
  #   url:        在线图书馆信息页
  #   remains:    剩余数
  #   total:      总数
  parseQueryResult: ($content) ->
    $cols = ($ i for i in $content.children)
    # 格式错误
    if $cols.length < 9
      return

    getColText = (idx) -> $cols[idx].text().trim()

    ctrlno = $('input', $cols[0]).attr('value').trim()

    bookInfos =
      title: getColText(1)
      ctrlno: ctrlno
      author: getColText(2)
      publisher: getColText(3)
      location: getColText(5)
      url: templates.bookUrl(ctrlno)
      remains: parseInt(getColText(7), 10)
      total: parseInt(getColText(6), 10)

    return bookInfos
  
  # 解析 http://222.200.98.171:81/searchresult.aspx
  # @return arrary | null
  #   books:  查询返回的书籍
  #   null:   查询失败
  parseQueryResults: (rawContent) ->
    content = utils.clean(rawContent)
    $page = (selector) -> $(selector, content)

    if $page('#searchnotfound').length isnt 0
      return

    return (@parseQueryResult result for result in $page('tbody tr'))
