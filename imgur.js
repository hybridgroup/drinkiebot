var request = require('request');

var postImage = function(token, album, image, callback) {
	var options = {
	  method: "POST",
	  url: 'https://api.imgur.com/3/image',
	  headers: {
	    'Authorization ': 'Client-ID ' + token
	  },
	  formData: {
	    image: image,
	    album: album
	  }
	};
	request(options, function (err, res, body) {
		callback(err, body);
	});
};

module.exports.postImage = postImage;
