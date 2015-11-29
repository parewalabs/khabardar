

/*
	var message = self.options.msg;
	var htmlResponseInner = "<div id='parewalabs-qualitynews-wrapper'> <div class='{class}' id='qualitynews-message'>{message}</div> <div id='qualitynews-close'>X</div> <img src='https://raw.githubusercontent.com/parewalabs/khabardar/master/extensions/chrome/khabardar48.png' alt='Khabardar' id='qualitynews-icon' /> </div>";
	htmlResponseInner = htmlResponseInner.replace('{class}', 'qualitynews-warning');
	htmlResponseInner = htmlResponseInner.replace('{message}', message);
	var htmlResponse = document.createElement('div');
	htmlResponse.innerHTML = htmlResponseInner;
	var domHtml = document.getElementsByTagName('html')[0];
	domHtml.insertBefore(htmlResponse, domHtml.children[0]);
	document.getElementById('parewalabs-qualitynews-wrapper').addEventListener('click', function(){ this.style.display = 'none' });
*/

/*
 * div#parewalabs-qualitynews-wrapper
 *   div.qualitynews-warning#qualitynews-message > message
 *   div#qualitynews-close > X
 *   img#qualitynews-icon
 */

//window.onload = function() {
	var message = self.options.msg;

	var htmlResponse = document.createElement('div');

	var wrapper = document.createElement('div');
	wrapper.id = 'parewalabs-qualitynews-wrapper';

	var message_div = document.createElement('div');
	message_div.id = 'qualitynews-message';
	message_div.className = 'qualitynews-warning';
	message_div.textContent = message;

	var box_close = document.createElement('div');
	box_close.id = 'qualitynews-close';
	box_close.textContent = 'X';

	var logo = document.createElement('img');
	logo.src = 'https://raw.githubusercontent.com/parewalabs/khabardar/master/extensions/chrome/khabardar48.png';
	logo.alt = 'Khabardar';
	logo.id = 'qualitynews-icon';

	wrapper.appendChild(message_div);
	wrapper.appendChild(box_close);
	wrapper.appendChild(logo);

	wrapper.onclick = function(e) {
		this.style.display = 'none';
	}

	htmlResponse.appendChild(wrapper);
	
	var domHtml = document.getElementsByTagName('html')[0];
	domHtml.insertBefore(htmlResponse, domHtml.children[0]);
//}
