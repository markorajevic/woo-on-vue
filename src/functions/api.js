// const request = require('request');
const OAuth = require('oauth-1.0a')
// var crypto  = require('crypto');
const promise = require('bluebird')
const _url = require('url')

/**
 * WooCommerce REST API wrapper
 *
 * @param {Object} config
 */
function WooCommerceAPI(config) {
  if (!(this instanceof WooCommerceAPI)) {
    return new WooCommerceAPI(config)
  }

  if (!config.url) {
    throw new Error('url is required')
  }

  if (!config.consumerKey) {
    throw new Error('consumerKey is required')
  }

  if (!config.consumerSecret) {
    throw new Error('consumerSecret is required')
  }

  this.classVersion = '1.4.2'
  this._setDefaultsOptions(config)
}

/**
 * Set default options
 *
 * @param {Object} opt
 */
WooCommerceAPI.prototype._setDefaultsOptions = function(config) {
  this.url = config.url
  this.wpAPI = config.wpAPI || false
  this.wpAPIPrefix = config.wpAPIPrefix || 'wp-json'
  this.version = config.version || 'v3'
  this.isSsl = /^https/i.test(this.url)
  this.consumerKey = config.consumerKey
  this.consumerSecret = config.consumerSecret
  this.verifySsl = config.verifySsl === false ? false : true
  this.encoding = config.encoding || 'utf8'
  this.queryStringAuth = config.queryStringAuth || false
  this.port = config.port || ''
  this.timeout = config.timeout
}

/**
 * Normalize query string for oAuth
 *
 * @param  {string} url
 * @return {string}
 */
WooCommerceAPI.prototype._normalizeQueryString = function(url) {
  if (url.indexOf('?') === -1) {
    return url
  }

  const query = _url.parse(url, true).query
  const params = []
  let queryString = ''

  for (const p in query) {
    params.push(p)
  }
  params.sort()

  for (const i in params) {
    if (queryString.length) {
      queryString += '&'
    }

    queryString += encodeURIComponent(params[i])
      .replace('%5B', '[')
      .replace('%5D', ']')
    queryString += '='
    queryString += encodeURIComponent(query[params[i]])
  }

  return `${url.split('?')[0]}?${queryString}`
}

/**
 * Get URL
 *
 * @param  {String} endpoint
 *
 * @return {String}
 */

WooCommerceAPI.prototype._getUrl = function(endpoint) {
  let url = this.url.slice(-1) === '/' ? this.url : `${this.url}/`
  const api = this.wpAPI ? `${this.wpAPIPrefix}/` : 'wc-api/'

  url = `${url + api + this.version}/${endpoint}`

  // Include port.
  if (this.port !== '') {
    let hostname = _url.parse(url, true).hostname
    url = url.replace(hostname, `${hostname}:${this.port}`)
  }

  if (!this.isSsl) {
    return this._normalizeQueryString(url)
  }

  return url
}

/**
 * Get OAuth
 *
 * @return {Object}
 */
WooCommerceAPI.prototype._getOAuth = function() {
  const data = {
    consumer: {
      key: this.consumerKey,
      secret: this.consumerSecret,
    },
    signature_method: 'HMAC-SHA256',
    hash_function(base_string, key) {
      return crypto
        .createHmac('sha256', key)
        .update(base_string)
        .digest('base64')
    },
  }

  if (['v1', 'v2'].indexOf(this.version) > -1) {
    data.last_ampersand = false
  }

  return new OAuth(data)
}

// /**
//  * Do requests
//  *
//  * @param  {String}   method
//  * @param  {String}   endpoint
//  * @param  {Object}   data
//  * @param  {Function} callback
//  *
//  * @return {Object}
//  */
// WooCommerceAPI.prototype._request = function(method, endpoint, data, callback) {
//   let url = this._getUrl(endpoint);

//   let params = {
//     url,
//     method,
//     encoding: this.encoding,
//     timeout: this.timeout,
//     headers: {
//       'User-Agent': `WooCommerce API Client-Node.js/${  this.classVersion}`,
//       'Accept': 'application/json'
//     }
//   };

//   if (this.isSsl) {
//     if (this.queryStringAuth) {
//       params.qs = {
//         consumer_key: this.consumerKey,
//         consumer_secret: this.consumerSecret
//       };
//     } else {
//       params.auth = {
//         user: this.consumerKey,
//         pass: this.consumerSecret
//       };
//     }

//     if (!this.verifySsl) {
//       params.strictSSL = false;
//     }
//   } else {
//     params.qs = this._getOAuth().authorize({
//       url,
//       method
//     });
//   }

//   if (data) {
//     params.headers['Content-Type'] = 'application/json;charset=utf-8';
//     params.body = JSON.stringify(data);
//   }

//   if (!callback) {
//     return request(params);
//   }

//   return request(params, callback);
// };

// /**
//  * GET requests
//  *
//  * @param  {String}   endpoint
//  * @param  {Function} callback
//  *
//  * @return {Object}
//  */
// WooCommerceAPI.prototype.get = function(endpoint, callback) {
//   return this._request('GET', endpoint, null, callback);
// };

// /**
//  * POST requests
//  *
//  * @param  {String}   endpoint
//  * @param  {Object}   data
//  * @param  {Function} callback
//  *
//  * @return {Object}
//  */
// WooCommerceAPI.prototype.post = function(endpoint, data, callback) {
//   return this._request('POST', endpoint, data, callback);
// };

// /**
//  * PUT requests
//  *
//  * @param  {String}   endpoint
//  * @param  {Object}   data
//  * @param  {Function} callback
//  *
//  * @return {Object}
//  */
// WooCommerceAPI.prototype.put = function(endpoint, data, callback) {
//   return this._request('PUT', endpoint, data, callback);
// };

// /**
//  * DELETE requests
//  *
//  * @param  {String}   endpoint
//  * @param  {Function} callback
//  *
//  * @return {Object}
//  */
// WooCommerceAPI.prototype.delete = function(endpoint, callback) {
//   return this._request('DELETE', endpoint, null, callback);
// };

// /**
//  * OPTIONS requests
//  *
//  * @param  {String}   endpoint
//  * @param  {Function} callback
//  *
//  * @return {Object}
//  */
// WooCommerceAPI.prototype.options = function(endpoint, callback) {
//   return this._request('OPTIONS', endpoint, null, callback);
// };

/**
 * Promifying all requests exposing new methods
 * named [method]Async like in getAsync()
 */
promise.promisifyAll(WooCommerceAPI.prototype)

// module.exports = WooCommerceAPI;
export default WooCommerceAPI
