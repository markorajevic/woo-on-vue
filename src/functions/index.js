import WooCommerceAPI from './api'

function WooService(config) {
  this.api = new WooCommerceAPI(config)
  this.config = config
}

WooService.prototype.getAllProducts = function (){
  return this.api.getAsync('products').then(data => data.toJSON().body);
}

WooService.prototype.addProduct = function (product){
  return this.api.postAsync('products', product).then(data => data.toJSON().body);
}

WooService.prototype.getSingleProduct = function (id){
  return this.api.getAsync('products/' + id).then(data => data.toJSON().body);
}

WooService.prototype.deleteProduct = function (id){
  return this.api.deleteAsync('products/' + id).then(data => data.toJSON().body);
}

WooService.prototype.getProductReviews = function (id){
  return this.api.getAsync('products/' + id + '/reviews').then(data => data.toJSON().body);
}

export default {
  WooService,
}
