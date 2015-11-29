var buttons = require('sdk/ui/button/toggle');
var panels = require('sdk/panel');
var tabs = require('sdk/tabs');
var ss = require('sdk/simple-storage');
var self = require('sdk/self');
var apiUrl = 'http://www.parewalabs.com:5000/reputation';

tabs.on('ready',checkDomain);

if(!ss.storage.mutedpages) {
	ss.storage.mutedpages = {}
}

var button = buttons.ToggleButton({
	id: "khabardar-settings",
	label: "Khabardar",
	icon: {
		"16": "./khabardar16.png",
		"48": "./khabardar48.png",
		"128": "./khabardar128.png"
	},
	onChange: handleChange
});

var panel = panels.Panel({
	contentURL: self.data.url("settings.html"),
	contentStyleFile: self.data.url('settings.css'),
	contentScriptFile: self.data.url('settings.js'),
	height: 150,
	onHide: handleHide
});

function handleChange(state) {
	if(state.checked) {
		panel.show({
			position: button
		});
		
		var currentdomain = getDomain(tabs.activeTab.url);
		var expiryTimeStamp = ss.storage.mutedpages[currentdomain];
		if(expiryTimeStamp == undefined) {
			var data = {
				url: currentdomain,
				muted: false
			}
		}
		else if(expiryTimeStamp == 0) {
			var data = {
				url: currentdomain,
				muted: true,
				expiry: 0
			}
		}
		else {
			var date = new Date(expiryTimeStamp);
			var datestr = date.toDateString() +' '+ date.toLocaleTimeString();
			var data = {
				url: currentdomain,
				muted: true,
				expiry: datestr
			}
		}

		panel.port.emit('msg',data);
	}
}

panel.port.on('mute',function(domain) {
	ss.storage.mutedpages[domain] = 0;
});

panel.port.on('unmute',function(domain) {
	if(ss.storage.mutedpages[domain] == 0) {
		delete ss.storage.mutedpages[domain];
	}
});

function handleHide() {
	button.state('window',{checked: false});
}


function getDomain(url) {
	var pageurl = url;
	if (pageurl.indexOf('//') > -1)
		pageurl = pageurl.split('//')[1];
	pageurl = pageurl.replace('www.', '');
	return pageurl.split(/[/?#]/)[0];
}

function checkDomain(tab) {
	checkDomainMuted(tab,
	function(tab) {
		//console.log('domain muted');
	},
	function(tab) {
		getReputation(tab, showResponse);
	});
}

function checkDomainMuted(tab, next_muted, next_notmuted) {
	var currentdomain = getDomain(tab.url);
	var expiryTimeStamp = ss.storage.mutedpages[currentdomain]
	if(expiryTimeStamp != undefined) {
		nowTimeStamp = (new Date).valueOf();
		if(expiryTimeStamp != 0 && nowTimeStamp > expiryTimeStamp) {
			delete ss.storage.mutedpages[currentdomain];
			next_notmuted(tab);
		}
		else {
			next_muted(tab);
		}
	}
	else {
		var val = new Date();
		val.setDate(val.getDate() + 14);
		ss.storage.mutedpages[currentdomain] = val.valueOf();
		next_notmuted(tab);
	}
}

/**
 * Check website reputation using Parewa Labs API
 * #purejs
 */
function getReputation(tab, callback) {
	var url = getDomain(tab.url);
	var postData = 'pageurl='+url;
	var xhr = require('sdk/request').Request;
	xhr({
		url: apiUrl,
		content: 'pageurl='+url,
		onComplete: function(response) {
			if(response.status == 200) {
				callback(tab, response.json);
			}
			else {
				//console.log('Couldn\'t make API request');
			}
		}
	}).post();
}

function showResponse(tab, res) {
	if (typeof res.message == 'undefined'){
		//console.log('Khabardar: got undefined message. Not displaying that.');
		return;
	}
	else if (res.message == "" || res.message == " "){
		//console.log('Khabardar: got empty message.');
		return;
	}

	var mod = require('sdk/content/mod');
	var style = require('sdk/stylesheet/style');
	var resStyle = style.Style({
		uri: './content_script.css'
	});

	var script = tab.attach({
		contentScriptFile: self.data.url('response.js'),
		contentScriptOptions: {
			msg: res.message
		}
	});
	mod.attach(resStyle,tab);
	
}

