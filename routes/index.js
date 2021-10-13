const router = require('koa-router')()
const api = require('../controllers/api')

router.get('/', async (ctx, next) => {
  ctx.body = {
    code: -1,
    data: []
  }
})
router.get('/getFormParams', api.getFormParams)
router.get('/getData', api.getData)
router.post('/search', api.search)
router.get('/getGuidePrice', api.getGuidePrice)

module.exports = router
