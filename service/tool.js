const crypto = require('crypto')

const OK = 0
const FAIL = -1

// 成功返回
function success(data = [], message = '获取成功') {
  return {
    code: OK,
    data,
    message
  }
}

// 失败返回
function fail(message = '获取失败',data = []) {
  return {
    code: FAIL,
    data,
    message
  }
}

// 去空格换行
function trim(text) {
  return text.replace(/\n|\s*/g, "");
}

// 格式化url为rediskey
function formatKey(url) {
  const md5 = crypto.createHash('md5').update(url).digest('hex')
  return `url_${md5}`
}

module.exports = {
  trim,
  success,
  fail,
  formatKey
}