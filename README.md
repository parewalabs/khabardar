### Quick links
[Download extension](https://chrome.google.com/webstore/detail/khabardar/gkjfjhoggjmlbdocpfgfbpaifmdegjim) |
[Trello board](https://trello.com/b/qYLIPuEC) | [Googlegroups forum](https://groups.google.com/forum/#!forum/khabardar-extension)

- - -

# 1. Reliable Nepali news
Khabardar is a native chrome extension that warns against unreliable news websites by displaying a popup in the top of the browser window.

## 1.1 A thin extension
The only job of the extension is to call the API on every page load and display any message received from the API.

Dissecting the `manifest.json` file:

	"browser_action":{
		"default_icon": "khabardar128.png",
		"default_title": "Khabardar settings",
		"default_popup": "settings.html"
	}

The *browser action* controls what happens when the extension icon (in the top right) is clicked. In this case, `settings.html` will be shown. Also, some icons are being set.

	"content_scripts":[
		{
			"matches": ["http://*/*"],
			"js":["content_script.js"],
			"css":["content_script.css"]
		}
	],

A *content script* is being injected on every page that corresponds a *match* (in this case all sites starting with http://, e.g. not https). The *js* and the *css* specified will be injected on every page load.

	"permissions":[
		"activeTab",
		"storage",
		"http://parewalabs.com:5000/reputation"
	],

The *permissions* section specifies that the extension needs access to the current tab, the [local storage](https://developer.chrome.com/extensions/storage) and a custom url which is our api.

## 1.2 A simple API
Backend written in [sails.js](http://sailsjs.org/)

### installed node_modules:

* `moment` parses dates
* `whois` retrieves whois information for a domain
* `node-cache` caches whois information on server in order to speed up whois lookup

### important files:

* `config/routes.js` A single route "POST /reputation" used by the extension. Sends and received json.
* `api/controllers/ApiController.js` Defines the priority in which checks are performed for the current website. Check first against the blacklist, then against the "unreputable" list, then check for too young age of website.
* `api/services/ApiService.js` Each "check" is an independent blackbox, so that it can be run in any order or stack onto each other.
* `config/locales/en.json` Defines messages to be sent to, and displayed by, the client. This prepares the app for messages not only in English, if the Accept-Header tells so. More on [locales](http://sailsjs.org/documentation/concepts/internationalization/locales).

### the blackbox approach:
As the number of blackbox filters will grow, this approach enables scalability.

	// api/services/ApiService.js
	...
	checkBlacklistedSite: function(obj){
		var BlacklistedDomains = [
			'funnysite.com'
		];
		return new Promise(function (resolve, reject){
			if (BlacklistedDomains.indexOf(obj.data.domain_name) > -1){
				obj.data.errorType = 'MsgBlacklistedSite';
				return reject(obj);
			}
			resolve(obj);
		});
	}

The function takes in an `obj` and returns the same `obj`, possibly with altered contents. This makes it easy to stack independent blackboxes onto each other, which can be seen in the controller that is consuming the blackboxes:

	// api/controllers/ApiController.js
	...
	ApiService.checkBlacklistedSite(obj)
	.then(function (obj){
		return ApiService.checkUnverifiedIdentity(obj);
	})
	.then(function (obj){
		return ApiService.checkInvalidDate(obj);
	})


The behavior is the same for all blackboxes: on failure, an errorType is set and the blackbox is "rejected", otherwise it is "resolved". The errorType is a key in the locale file which translates into a message for the user.

# 2. Use
To try it out, just install the extension from the [Chrome Webstore](https://chrome.google.com/webstore/detail/khabardar/gkjfjhoggjmlbdocpfgfbpaifmdegjim). To contribute, clone/check out the code.

When developing, you can either use the live version of the api, or develop with a local copy of the backend. For the local copy, you will need to install [node.js v4](https://nodejs.org/en/download/package-manager/) or higher. To develop the extension, the [chrome extension tutorial](https://developer.chrome.com/extensions) is a good start.

# 3. Get social
Talk with us on [googlegroups](https://groups.google.com/forum/#!forum/khabardar-extension)  
Work with us using the [Trello](https://trello.com/b/qYLIPuEC) issue tracker