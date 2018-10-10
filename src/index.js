// import getAllProducts from './functions/products'
import WooService from './functions/index'
// import { WooService as _WooService } from './functions/index';

function WooToVue(config) {
  return new WooService.WooService(config)
  // this.config = config;
}

WooToVue.prototype.bar = function() {}
// module.exports.getAllProducts = function () {
//   return 'getAllProducts';
// }
export default WooToVue
