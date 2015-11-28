

window.onload = function() {
	var message = self.options.msg;
	var htmlResponseInner = "<div id='parewalabs-qualitynews-wrapper'> <div class='{class}' id='qualitynews-message'>{message}</div> <div id='qualitynews-close'>X</div> <img src='https://raw.githubusercontent.com/parewalabs/khabardar/master/extensions/chrome/khabardar48.png' alt='Khabardar' id='qualitynews-icon' /> </div>";
	htmlResponseInner = htmlResponseInner.replace('{class}', 'qualitynews-warning');
	htmlResponseInner = htmlResponseInner.replace('{message}', message);
	var htmlResponse = document.createElement('div');
	htmlResponse.innerHTML = htmlResponseInner;
	var domHtml = document.getElementsByTagName('html')[0];
	domHtml.insertBefore(htmlResponse, domHtml.children[0]);
	document.getElementById('parewalabs-qualitynews-wrapper').addEventListener('click', function(){ this.style.display = 'none' });
}
