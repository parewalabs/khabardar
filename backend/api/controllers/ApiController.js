/**
 * ApiController
 *
 * @description :: Server-side logic for managing apis
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
module.exports = {
	/**
	 * 1. Extract root domain and ending (e.g. google.com) by removing:
	 * 		- any protocol: http, https, ftp, ...
	 * 		- the 'www'
	 * 		- anything after the main domain: /..., ?..., #...
	 * 2. Get whois information for the domain
	 * @param {string} domain
	 */
	whois: function(req, res){
		var moment = require('moment');
		var whois = require('whois');
		var data = req.body;
		console.log(data);
		var pageurl = data.pageurl;
		if (pageurl.indexOf('//') > -1)
			pageurl = pageurl.split('//')[1];
		pageurl = pageurl.replace('www.', '');
		var domain = pageurl.split(/[/?#]/)[0];

		var lookupInfo = {};
		whois.lookup(domain, function (err, data) {
			var fields = data.split(/\r?\n/g);
			for (var i = 0; i < fields.length; i++) {
				if (fields[i].indexOf('Domain Name:') > -1){
					var domain_name = fields[i].split(':')[1].trim();
					lookupInfo['domain_name'] = domain_name;
				}
				else if (fields[i].indexOf('Creation Date:') > -1){
					var now = moment();
					var creation_date_str = fields[i].split(':')[1].split('T')[0].trim();
					lookupInfo['creation_date'] = creation_date_str;
					var creationDate = moment(creation_date_str);
					var dateIsValid = now.diff(creationDate, 'years', true) >= 1;

					lookupInfo['date_is_valid'] = dateIsValid;
					lookupInfo['message'] = dateIsValid ? '' : res.i18n('MsgInvalidDate');
					// lookupInfo['message'] = 'testing 123 <a href="http://www.google.com">asdf</a>';
					// lookupInfo['date_is_valid'] = false;

					break;
				}
			}
			res.send(lookupInfo);
		});
	}
};