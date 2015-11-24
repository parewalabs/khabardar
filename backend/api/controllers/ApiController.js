/**
 * ApiController
 */
var ApiController = {
	/**
	 * Main entry point. Go through priority list. Jump out prematurely if any of the checks is positive.
	 *
	 * Priority
	 * 0. checks whitelisted sites
	 * 1. checks blacklisted sites
	 * 2. checks unverified ID (blogging sites)
	 * 3. checks website age (uses whois)
	 *
	 * The catch-block is executed when some of the checking blocks reports positively.
	 * In that case, sets message depending on errorType and sends it to client.
	 */
	entry: function(req, res){
		// Initial data
		var rootDomain = ApiService.extractDomainFromUrl(req.body.pageurl);
		var obj = {
			data: {
				"domain_name": rootDomain
			},
			response: {
				"message": ""
			}
		}

		// Pipeline
		ApiService.checkWhitelistedSite(obj)
		.then(function (obj){
			return ApiService.checkBlacklistedSite(obj);
		})
		.then(function (obj){
			return ApiService.checkUnverifiedIdentity(obj);
		})
		.then(function (obj){
			return ApiService.checkInvalidDate(obj);
		})
		.then(function (obj){
			res.json(obj.response);
		})
		.catch(function (obj) {
			obj.response.message = res.i18n(obj.data.errorType);
			if (typeof obj.response.message === undefined)
				obj.response.message = res.i18n('ServerError');
			res.json(obj.response);
		});
	}
};

module.exports = ApiController;