# templates/library.coffee
# 图书馆模板

config = require '../config'


module.exports =
  queryISBNURLBuilder: (isbn) ->
    "#{config.libraryBaseUrl}/searchresult.aspx?dp=50&isbn_f=#{isbn}"

  queryTitleURLBuilder: (title) ->
    "#{config.libraryBaseUrl}/searchresult.aspx?dp=50&title=#{title}"
  
  queryKeywordURLBuilder: (keyword) ->
    "#{config.libraryBaseUrl}/searchresult.aspx?dp=50&anywords=#{keyword}"

  bookUrl: (ctrlno) ->
    "#{config.libraryBaseUrl}/bookinfo.aspx?ctrlno=#{ctrlno}"

  recommendUrl: (infos) ->
    "#{config.libraryBaseUrl}/readerrecommend.aspx?douban_ref=#{infos.id}"
