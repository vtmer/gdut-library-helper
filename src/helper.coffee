# helper.coffee
# 图书馆助手实例

utils = require './utils'
pages = require './pages'


module.exports = helper =
  options:
    # 图书馆地址，不带末尾斜杠
    libraryUrl: 'http://222.200.98.171:81'

    # 图书信息本地缓存时长（浏览次数）
    localCacheLife: 5

  # 根据当前浏览器 url 地址进行操作分发
  dispatch: ->
    matched = /[com, 81]\/([\w]+)\/*/.exec document.URL
    pageName = if matched is null then 'index' else matched[1].trim()

    utils.log "Processing #{pageName}."
    switch pageName
      # Douban 相关页面
      when 'subject' then @page.doubanBookItem()
      when 'subject_search' then @page.doubanBooksSearch()
      when 'doulist' then @page.doubanBooksList()
      
      # 图书馆相关页面
      when 'readerrecommend' then @page.libraryReaderRecommend()

      else utils.errLog "Unable to find page handler for #{pageName}."

  # 页面处理
  page:
    # douban 书籍简介页面
    doubanBookItem: ->
      pages.douban.item.handle()

    # douban 书籍查询页面
    doubanBooksSearch: ->
      pages.douban.search.handle()

    # douban 书单页面
    doubanBooksList: ->
      pages.douban.list.handle()

    # 图书馆读者推荐页面
    libraryReaderRecommend: ->
      pages.library.recommend.handle()
