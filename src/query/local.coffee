# query/local.coffee
# 从本地缓存中进行查询

utils = require '../utils'
config = require '../config'


module.exports =
  # 根据图书 id 查询
  bookId: (id) ->
    dfd = new $.Deferred

    bookInfos = utils.cache.read(id)
    if bookInfos is null
      utils.errLog "#{id} not found from cache."
      dfd.resolve bookInfos
    else
      if not bookInfos._viewTimes?
        bookInfos._viewTimes = 0

      if bookInfos._viewTimes > config.localCacheLife
        utils.errLog "#{id} hits too many times from cache, throw it."
        dfd.resolve bookInfos
      else
        utils.log "Found #{id} from cache."
        dfd.reject bookInfos

    return dfd.promise()
