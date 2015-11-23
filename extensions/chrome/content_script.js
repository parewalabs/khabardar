/**
 * content_script.js
 * On every page load:
 *   1. request information for current page
 *   2. display information in a div in top of body
 */

var apiUrl		= "http://www.parewalabs.com:5000/reputation";
var currentUrl	= document.location.href;
var currentDomain = extractDomainFromUrl(currentUrl);
main();

function main(){
	checkDomainMuted(currentDomain, function(){
		// console.log('domain muted, abort');
	}, function(){
		getReputation(currentUrl, showResponse);
	});
}
function checkDomainMuted(domain, next_muted, next_notmuted){
	chrome.storage.sync.get(domain, function (items){
		if (Object.keys(items).length > 0){
			// value is 0 <=> manually muted
			// value > 0  <=> automatically muted and will expire
			var expiryTimestamp = items[domain];
			var nowTimestamp = (new Date).valueOf();
			console.log('nowTimestamp > expiryTimestamp', nowTimestamp > expiryTimestamp);
			if (expiryTimestamp != 0 && nowTimestamp > expiryTimestamp){
				console.log('site now>expiry', nowTimestamp, expiryTimestamp);
				chrome.storage.sync.remove(domain, function (){
					next_notmuted();
				});
			} else {
				console.log('site muted until', (new Date(items[domain])).toString());
				next_muted();
			}
		} else {
			console.log('first time not muted');
			// If nothing in storage => store automatic mute for 1 day for current website
			var data = {};
			var val = new Date();
			val.setDate(val.getDate() + 1);
			data[domain] = val.valueOf();
			chrome.storage.sync.set(data, function (){
				next_notmuted();
			});
		}
	});
}
/**
 * Check website reputation using Parewa Labs API
 * #purejs
 */
function getReputation(url, callback) {
	var postData = 'pageurl='+url;
	var xhr = new XMLHttpRequest();
	xhr.open("POST", apiUrl, true);
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.onreadystatechange = function(){
		if (xhr.status == 200){
			if (xhr.readyState == 4){
				var parsedResponse = JSON.parse(xhr.responseText);
				callback(parsedResponse);
			}
		} else {
			callback("Extension error " + xhr.status);
		}
	};
	xhr.send(postData);
}
/**
 * 1. Create message
 * 2. Add to body
 * @param  {json} res The server response
 */
function showResponse(res){
	if (res.message == "") return;

	var htmlResponseInner = "<div id='parewalabs-qualitynews-wrapper'> <div class='{class}' id='qualitynews-message'>{message}</div> <div id='qualitynews-close'>X</div> </div>";
	htmlResponseInner = htmlResponseInner.replace('{class}', res.date_is_valid ? 'qualitynews-info' : 'qualitynews-warning');
	htmlResponseInner = htmlResponseInner.replace('{message}', res.message);

	var htmlResponse = document.createElement('div');
	htmlResponse.innerHTML = htmlResponseInner;
	var domHtml = document.getElementsByTagName('html')[0];
	domHtml.insertBefore(htmlResponse, domHtml.children[0]);
	document.getElementById('parewalabs-qualitynews-wrapper').addEventListener('click', function(){ this.style.display = 'none' });
}

// Helper functions
function extractDomainFromUrl(url){
	var pageurl = url;
	if (pageurl.indexOf('//') > -1)
		pageurl = pageurl.split('//')[1];
	pageurl = pageurl.replace('www.', '');
	return pageurl.split(/[/?#]/)[0];
}