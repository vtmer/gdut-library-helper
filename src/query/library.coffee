# query/library.coffee
# 图书馆查询接口


parser = (require '../parser').library
templates = (require '../templates').library
utils = (require '../utils')


# 构造一个查询接口
#
# @param queryUrlBuilder  查询地址构造器
# @param filter           查询结果过滤器
# @param respParser       查询结果解析器
queryFactory = (queryUrlBuilder, filter, respParser = null) ->
  respParser = parser.parseQueryResults unless respParser

  return (queryValue) ->
    dfd = new $.Deferred
    queryUrl = queryUrlBuilder queryValue

    GM_xmlhttpRequest(
      method: 'GET'
      url: queryUrl
      onload: (resp) ->
        parsedResults = respParser resp.responseText
        if not parsedResults
          dfd.resolve parsedResults
          return

        result = filter(queryValue, parsedResults)
        # 找到一个准确的结果
        if result
          dfd.reject result
        # 找到若干个准确的结果
        else
          dfd.resolve(
            queryUrl: queryUrl
            results: parsedResults
          )
    )

    return dfd.promise()


publisherFilterFactory = (bookMeta) ->
  (value, results) ->
    for result in results
      if result.publisher is bookMeta.publisher
        return result
    return null


alwaysSuccessFilter = (base, candidate) -> candidate
alwaysFailFilter = -> null


module.exports =

  # 根据任意关键字进行查询
  keyword: (keyword) ->
    dfd = new $.Deferred

    keywordQuery = queryFactory(
      templates.queryKeywordURLBuilder
      alwaysFailFilter
    )

    utils.convertGB2312(keyword)
      # FIXME convertGB2312 失败的情况？
      .then(keywordQuery)
      # 永远都只有失败状态
      .always(dfd.resolve)

    return dfd.promise()

  # 根据图书标题进行查询
  title: (bookMeta) ->
    dfd = new $.Deferred

    titleQuery = queryFactory(
      templates.queryTitleURLBuilder
      publisherFilterFactory bookMeta
    )

    utils.convertGB2312(bookMeta.title)
      # FIXME convertGB2312 失败的情况？
      .then(titleQuery)
      # 查询失败，返回失败信息
      .then(dfd.resolve)
      # 查询成功，返回查询结果
      .fail(dfd.reject)

    return dfd.promise()

  # 根据图书 isbn 进行查询
  isbn: (bookMeta) ->
    dfd = new $.Deferred

    isbnQuery = queryFactory(
      templates.queryISBNURLBuilder
      publisherFilterFactory bookMeta
    )

    # 查询 10 位 isbn
    isbnQuery(bookMeta.isbn10)
      # 查询失败，查询 13 位
      .then(-> isbnQuery(bookMeta.isbn13))
      # 查询失败，返回失败信息
      .then(dfd.resolve)
      # （任意一个）查询成功，返回书籍信息
      .fail(dfd.reject)

    return dfd.promise()

  # 根据图书控制编号 (ctrlno) 进行查询
  ctrlNo: (bookMeta) ->
    dfd = new $.Deferred

    dfd.reject(bookMeta) unless bookMeta.ctrlno

    ctrlNoQuery = queryFactory(
      templates.queryCtrlNoURLBuilder
      alwaysSuccessFilter
      parser.parseBookInfo
    )

    mergeCollection = (bookColl) -> $.extend({}, bookMeta, bookColl)

    ctrlNoQuery(bookMeta.ctrlno)
      # 查询失败返回原结果
      .then(-> dfd.resolve(bookMeta))
      # 查询成功返回馆藏信息
      .fail((bookColl) -> (dfd.reject mergeCollection bookColl))

    return dfd.promise()
