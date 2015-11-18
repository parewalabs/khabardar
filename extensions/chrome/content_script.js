/**
 * content_script.js
 * On every page load:
 *   1. request whois information for current page
 *   2. display information in a div in top of body
 */

// var apiUrl		= "http://www.parewalabs.com:5000/whois";
var apiUrl		= "http://localhost:3000/whois";
var currentUrl	= document.location.href;
whois(currentUrl, showResponse);

/**
 * Request whois using Parewa Labs API
 * @description pure JS, no jQuery
 */
function whois(url, callback) {
	var postData = 'pageurl='+url;
	var xhr = new XMLHttpRequest();
	xhr.open("POST", apiUrl, true);
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.onreadystatechange = function(){
		console.log('onreadystatechange responseText:', xhr.responseText);
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
	if (!res.date_is_valid){
		var htmlResponseInner = "<div id='parewalabs-qualitynews-wrapper'> <div class='{class}' id='qualitynews-message'>{message}</div> <div id='qualitynews-close'>X</div> </div>";
		htmlResponseInner = htmlResponseInner.replace('{class}', res.date_is_valid ? 'qualitynews-info' : 'qualitynews-warning');
		htmlResponseInner = htmlResponseInner.replace('{message}', res.message);

		var htmlResponse = document.createElement('div');
		htmlResponse.innerHTML = htmlResponseInner;
		var domHtml = document.getElementsByTagName('html')[0];
		domHtml.insertBefore(htmlResponse, domHtml.children[0]);
		document.getElementById('parewalabs-qualitynews-wrapper').addEventListener('click', function(){ this.style.display = 'none' });
	}
}