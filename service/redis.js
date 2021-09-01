const config = require('../config')
const ioredis = require('ioredis')

const baseConfig = {
  family: 4
}
const redis = new ioredis(Object.assign(baseConfig, config.redis))

module.exports = redis