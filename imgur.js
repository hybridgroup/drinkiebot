var imgur = require("imgur");

var postImage = function(token, album, image, callback) {
	imgur.setClientId(token);
	imgur.uploadFile(image, album)
    .then(function (json) {
        console.log(json.data.link);
				callback(null, json);
    })
    .catch(function (err) {
        console.error(err.message);
				callback(err, null);
    });
}

module.exports.postImage = postImage;
