# templates/douban.coffee
# Douban 页面模板

libraryTmpl = require './library'


module.exports =

  subject:
    bookInfos: (infos) ->
      """
      <span class="pl">GDUT:</span> 
      <a href="#{infos.url}" target="_blank">还剩 #{infos.remains} 本</a>
      <br />
      在 #{infos.location}
      """

    notFound: (infos) ->
      recommendUrl = libraryTmpl.recommendUrl(infos)
      """
      <span class="pl">GDUT:</span> 
      没有找到噢，<a href="#{recommendUrl}" target="_blank">去荐购</a>
      """

    foundMultiple: (infos) ->
      """
      <span class="pl">GDUT:</span> 
      <a href="#{infos.queryUrl}" target="_blank">找到 #{infos.results.length} 本类似的</a>
      """

  queryItem: (bookId) ->
    "http://book.douban.com/subject/#{bookId}/"
