# utils.coffee
# 脚手架函数集

config = require './config'


module.exports = utils =

  # 日志记录
  log: (something) ->
    console.log something 

  # 错误日志记录
  errLog: (something) ->
    console.error something

  # 转换 isbn 到指定长度（10 或 13）
  convertISBN: (isbn, length) ->
    parsedISBN = ISBN.parse isbn

    switch length
      when 10 then return (parsedISBN.asIsbn10 true)
      when 13 then return (parsedISBN.asIsbn13 true)

  # 将 utf-8 编码字符转换为 gb2312 编码
  convertGB2312: (keyword) ->
    dfd = new $.Deferred
    encodedKeyword = encodeURIComponent(keyword)

    GM_xmlhttpRequest(
      method: 'GET'
      url: "http://www.baidu.com/s?ie=utf-8&wd=#{encodedKeyword}"
      overrideMimeType: 'text/xml; charset=gb2312'
      onload: (resp) ->
        if resp.status < 200 or resp.status > 300
          utils.errLog "Failed to convert #{keyword} to gb2312."
          dfd.reject keyword
          return

        gb2312Keyword = String(resp.responseText.match /word=[^'"&]+['"&]/i)
          .replace(/word=|['"&]/ig, '')

        dfd.resolve gb2312Keyword
      onerror: ->
        utils.errLog "Failed to convert #{keyword} to gb2312."
    )

    return dfd.promise()

  cache:
    # 从本地缓存中读取值并按 JSON 格式解析
    read: (key) ->
      realKey = "#{config.localCacheKeyPrefix}#{key}"
      
      item = localStorage.getItem(realKey)
      return JSON.parse(localStorage.getItem(realKey))

    # 写入数据（会被 JSON 序列化）到本地缓存
    write: (key, value) ->
      realKey = "#{config.localCacheKeyPrefix}#{key}"

      localStorage.setItem(realKey, JSON.stringify(value))

    # 写入图书记录信息，并将 ``_viewTimes`` 字段增加一
    writeBookInfos: (key, bookInfos) ->
      if not bookInfos._viewTimes?
        bookInfos._viewTimes = 0
      bookInfos._viewTimes = bookInfos._viewTimes + 1

      utils.cache.write(key, bookInfos)

  # 去除外部资源的请求链接
  clean: (content) ->
    tags = [
       /<img.*>/gi
       /<script.*>.*<\/script>/gi
       /<link.*>.*<\/link>/gi
       /<style.*>.*<\/style>/gi
    ]

    for pattern in tags
      content = content.replace(pattern, '')

    return content
