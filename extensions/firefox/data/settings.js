window.onload = function() {
	var checkbox = document.getElementById('settings-mute');
	self.port.on('msg',function(msg) {
		console.log('received');
		console.log(msg);
		var muted = document.querySelector('#info-muted-w');
		if(msg.muted) {
			var currentdomain = document.querySelectorAll('.currentdomain');
			currentdomain[0].innerHTML = msg.url;
			currentdomain[1].innerHTML = msg.url;
			var muted_until = document.querySelector('#info-muted-until');
			
			if(msg.expiry == 0) {
				muted_until.innerHTML = 'forever';
			}
			else {
				muted_until.innerHTML = msg.expiry;
			}
			
			muted.className = 'visible';
		}
		else {
			muted.className = '';
		}

		checkbox.onclick = function(e) {
			if(checkbox.checked) {
				self.port.emit('mute',msg.url);
			}
			else {
				// unmute
				self.port.emit('unmute',msg.url);
			}
		}

	});
}
