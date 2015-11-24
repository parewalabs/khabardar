/**
 * ApiService
 *
 * @description Each check*-function is an independent block. Blocks can be stacked in any order.
 *              Blocks behave in the same way: rejects if condition is met, resolves otherwise.
 *              If a block resolves, the pipeline flow continues, otherwise it's "catched".
 *              The resolve/reject functions can only return 1 value, so many parameters (i.e.
 *              "data" and "response") have to be encapsulated.
 */
module.exports = {
	/**
	 * Extract root domain and ending, e.g. parewalabs.com, by removing:
	 * 		- any protocol: http, https, ftp, ...
	 * 		- the 'www'
	 * 		- anything after the main domain: /..., ?..., #...
	 * 	@return {string} root domain
	 */
	extractDomainFromUrl: function(url){
		if (typeof url === undefined)
			return "";
		var pageurl = url;
		if (pageurl.indexOf('//') > -1)
			pageurl = pageurl.split('//')[1];
		pageurl = pageurl.replace('www.', '');
		return pageurl.split(/[/?#]/)[0];
	},
	/**
	 * Manual whitelist
	 */
	checkWhitelistedSite: function(obj){
		var WhitelistedDomains = [
			'startupsinnepal.com'
		];
		return new Promise(function (resolve, reject){
			if (WhitelistedDomains.indexOf(obj.data.domain_name) > -1){
				obj.data.errorType = 'MsgWhitelistedSite';
				return reject(obj);
			}
			resolve(obj);
		});
	},
	/**
	 * Manual blacklisting
	 */
	checkBlacklistedSite: function(obj){
		var BlacklistedDomains = [
			'kantipath.com',
			'purbelinews.com'
		];
		return new Promise(function (resolve, reject){
			if (BlacklistedDomains.indexOf(obj.data.domain_name) > -1){
				obj.data.errorType = 'MsgBlacklistedSite';
				return reject(obj);
			}
			resolve(obj);
		});
	},
	/**
	 * Checks current domain against known untrusted blogs
	 */
	checkUnverifiedIdentity: function(obj){
		var BadDomains = [
			'blogger.',
			'blogspot.',
			'tumblr.',
			'wordpress.'
		];
		return new Promise(function (resolve, reject){
			for (var i = BadDomains.length - 1; i >= 0; i--) {
				if (obj.data.domain_name.match(new RegExp(BadDomains[i], 'i'))){
					obj.data.errorType = 'MsgUnverifiedIdentity';
					return reject(obj);
				}
			}
			resolve(obj);
		});
	},
	/**
	 * Wrapper for checking age of website using whois information
	 * 1. Look in cached results
	 * 2. Lookup whois
	 */
	checkInvalidDate: function(obj){
		return new Promise(function (resolve, reject){
			ApiService.checkInvalidDate_cache(obj)
			.then(function (obj){
				return ApiService.checkInvalidDate_whois(obj);
			})
			.then(function (obj){
				resolve(obj);
			})
			.catch(function (obj){
				reject(obj);
			});
		});
	},
	/**
	 * Checks website age using cached whois information
	 * On error in cache, make note of it and bubble on as everything's OK.
	 */
	checkInvalidDate_cache: function(obj){
		var moment	= require('moment');
		return new Promise(function (resolve, reject){
			sails.config.cache.get(obj.data.domain_name, function (err, value){
				if (!err){
					if (value == undefined)
						return resolve(obj);

					var date = moment(value.date);
					var now = moment();
					var dateNotValid = now.diff(date, 'years', true) < 1;
					if (dateNotValid){
						obj.data.errorType = 'MsgInvalidDate';
						reject(obj);
					} else {
						resolve(obj);
					}
				} else {
					// console.error('ApiService.checkInvalidDate_cache: error reading cache:', err);
					resolve(obj);
				}
			});
		});
	},
	/**
	 * Checks website age using whois information
	 * On error in module 'whois', bubble on as everything's OK.
	 */
	checkInvalidDate_whois: function(obj){
		var moment	= require('moment');
		var whois	= require('whois');
		return new Promise(function (resolve, reject){
			whois.lookup(obj.data.domain_name, function (err, whois_info) {
				if (!err){
					var fields = whois_info.split(/\r?\n/g);
					for (var i = 0; i < fields.length; i++) {
						if (fields[i].indexOf('No match for domain') > -1){
							// console.log('no match');
							break;
						}
						else if (fields[i].indexOf('Creation Date:') > -1){
							var creation_date_str = fields[i].split(':')[1].split('T')[0].trim();
							var creationDate = moment(creation_date_str);

							var cacheObj = { "date": creationDate.format() };
							sails.config.cache.set(obj.data.domain_name, cacheObj, function (err, success){
								if (!err && success){
									// console.log('cached result', obj.data.domain_name, cacheObj);
								} else {
									// console.error('caching result failed');
								}
							});

							var now = moment();
							var dateNotValid = now.diff(creationDate, 'years', true) < 1;
							if (dateNotValid){
								obj.data.errorType = 'MsgInvalidDate';
								return reject(obj);
							}
							break;
						}
					}
				}
				resolve(obj);
			});
		});
	}
}