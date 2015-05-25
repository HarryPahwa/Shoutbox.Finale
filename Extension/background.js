// oauth
var oauth = ChromeExOAuth.initBackgroundPage({
	request_url: 'https://api.twitter.com/oauth/request_token',
	authorize_url: 'https://api.twitter.com/oauth/authorize',
	access_url: 'https://api.twitter.com/oauth/access_token',
	consumer_key: 'JeSDrMy0zMDh7Pmt3xWSLy0hh',
	consumer_secret: 'Hfky1qT3IITyANQrA4cOtiUCHujseMV389eKHwLqf7mIuoWRLf',
	scope: '',
	app_name: 'ShoutBox.extension'
});

function install() {
	console.log("Check localStorage"); 
	Twitter.verify_credentials({install: true});
	Twitter.direct_messages({silent: true});
	Twitter.mentions({silent: true});
	// Location.search();
	localStorage.installed = 'true';
	// Poll.start();
	console.log('ShoutBox installed successfully!');
}
function init() {
	console.log("inside init");
	if (localStorage.installed != 'true') {
		oauth.authorize(install);
	} else {
		// Poll.start();
	}
}

init(); 


// function callback(resp, xhr) {
// 	alert("I don't know what I'm doing lol"); 
// }

// oauth.authorize(function() {
// 	console.log("running authorize"); 
// 	var url = 'http://api.twitter.com/1/account/verify_credentials.json'; 
// 	var request = {
// 		'force_login': '', 
// 		'screen_name': ''};
// 	oauth.sendSignedRequest(url, callback, request);
// 	console.log("work?");
// })

// This event is fired each time the user updates the text in the omnibox,
// as long as the extension's keyword mode is still active.
chrome.omnibox.onInputChanged.addListener(function(text, suggest) {
	
	// console.log('inputChanged: ' + text);
	
	// First suggest line
	var char_remain = new String();
	if (text.length<=140){
			char_remain=String(140-text.length) + " Characters remaining";
		}
		else {
			char_remain="Too Long!";
		}
	chrome.omnibox.setDefaultSuggestion({
		description: char_remain
	});
	
	// Other suggest lines
	suggest([
		{content: text + " ", description: "You can mention people too! Type '@' followed by the twitter handle!"},
		{content: text + " ", description: "Post links, they'll automatically shorten!"},
	]);
});

// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener(function(text) {

	console.log('inputEntered: ' + text);

	// Initialize variable for the number of characters
	var no_of_char=0;
	no_of_char=text.length;
	
	// If the tweet goes over 140 characters send a notification
	if (Notification.permission !== "granted") {
		// 
		Notification.requestPermission();
	}
	if (no_of_char>140) {
		var notification = new Notification('Character limit exceeded', {
			icon: 'twittericon.png',
			body: "Oops! You're tweet was too long, try again!",
		});
		notification.onclick = function () {
			window.open("http://twitter.com/");
		}
	}

	// Post using Twitter shit
	// Twitter.update(text);

	var xmlhttp=new XMLHttpRequest();
	xmlhttp.open("GET","http://localhost:3000/post-status?message=" +  encodeURIComponent(text),true);
	xmlhttp.send();

	// xmlhttp.open("GET","http://localhost:3000/post-status?message=" +  encodeURIComponent(text),
	//		+ "&token=" + encodeURIComponent(token)
	// 		+ "&secret=" + encodeURIComponent(secret)
	//		,true);

	http://localhost:3000/post-status?message=hi&?token=wer
	/* Old stuff 
		// getting keys and tokens for user's app
		ck = localStorage.getItem("ckey");
		cs = localStorage.getItem("csec");
		tk = localStorage.getItem("tkey");
		ts = localStorage.getItem("tsec");
		
		// Sending information to server
		console.log("before xml");

		var xmlhttp=new XMLHttpRequest();
		xmlhttp.open("GET","http://localhost:3000/post-status?message=" +  encodeURIComponent(text),true);
		xmlhttp.send();
	*/
});