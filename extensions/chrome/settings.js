window.onload = load;
function load(){
	chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
		// Vars
		var currentDomain = extractDomainFromUrl(tabs[0].url);
		var cboMute = document.getElementById('settings-mute');

		// View logic
		var els = document.getElementsByClassName('currentdomain');
		for (var i = els.length - 1; i >= 0; i--) {
			els[i].innerHTML = currentDomain;
		};

		chrome.storage.sync.get(currentDomain, function (items){
			cboMute.checked = Object.keys(items).length;
		});

		// Click handlers
		cboMute.onclick = function(e){
			if (cboMute.checked){
				var data = {};
				data[currentDomain] = 0;
				chrome.storage.sync.set(data, function (){
					// console.log('stored', currentDomain);
				});
			} else {
				chrome.storage.sync.remove(currentDomain, function (){
					// console.log('removed', currentDomain);
				});
			}
		};
	});
}

function extractDomainFromUrl(url){
	var pageurl = url;
	if (pageurl.indexOf('//') > -1)
		pageurl = pageurl.split('//')[1];
	pageurl = pageurl.replace('www.', '');
	return pageurl.split(/[/?#]/)[0];
}