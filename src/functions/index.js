import WooCommerceAPI from './api'

function WooService(config) {
  this.api = new WooCommerceAPI({
    url: 'http://example.com',
    consumerKey: 'ck_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    consumerSecret: 'cs_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    wpAPI: true,
    version: 'wc/v1',
  })
  this.config = config
}

WooService.prototype.getAllProducts = function() {
  return this.api._getOAuth()
}

// module.exports  = WooService;

export default {
  WooService,
}
