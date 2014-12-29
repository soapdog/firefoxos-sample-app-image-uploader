/**
 * Mininal Imgur API Wrapper
 *
 */

var imgur = imgur || {};

imgur.config = {
    clientId: "226dd8effca185e",
    clientSecret: "4dc33e33717e802caf31b9df3affe06d6f12b139"
};

imgur.setAuthorizationToken = function(token) {
    imgur.config.authToken = token;
};

imgur.setRefreshToken = function(token) {
    imgur.config.refreshToken = token;
};

imgur.setAccountUsername = function(username) {
    imgur.config.username = username;
};

/**
 * Uploads an image anonymously to imgur.com
 * We pass the binary file data and a callback to be called
 * after the upload succeeds or fail.
 *
 * @param file
 * @param inCallback
 *
 * This code is based on the minimal uploader from:
 *
 *   https://hacks.mozilla.org/2011/03/the-shortest-image-uploader-ever/
 *
 * but this code was updated to the version 3 of the imgur API while the one
 * in that article is version 2.
 *
 * More information about imgur API v3 at:
 *
 *   http://api.imgur.com/
 */
imgur.share = function(file, anonymously, inCallback, progressCallback) {

    var fd = new FormData();
    fd.append("image", file); // Append the file
    fd.append("type", "file"); // Append the file


    // Create the XHR (Cross-Domain XHR FTW!!!)
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.imgur.com/3/image.json"); // Boooom!
    if (imgur.config.authToken && !anonymously) {
        xhr.setRequestHeader("Authorization", "Bearer " + imgur.config.authToken);
    } else {
        xhr.setRequestHeader("Authorization", "Client-ID 226dd8effca185e");
    }
    xhr.onload = function() {
        // Big win!
        // The URL of the image is:
        console.log(xhr.responseText);
        var response = JSON.parse(xhr.responseText);

        if (response.success) {
            console.log("image sharing succeeded");
            console.log("url", response.data.link);
            inCallback(null, response);
        } else {
            console.log(response);
            inCallback(response, null);
        }
    }
	xhr.upload.onprogress= function(e){
		var percentComplete = Math.round((e.loaded / e.total) * 100);
		if(progressCallback)
			progressCallback(percentComplete);
	}
    xhr.send(fd);
}

imgur.refreshAccessToken = function(inCallback) {
    var fd = new FormData();

    console.log("Refreshing tokens...");

    fd.append("client_id", imgur.config.clientId);
    fd.append("client_secret", imgur.config.clientSecret);
    fd.append("grant_type", "refresh_token");
    fd.append("refresh_token", imgur.config.refreshToken);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.imgur.com/oauth2/token");
    xhr.setRequestHeader("Authorization", "Client-ID 226dd8effca185e");

    xhr.onload = function() {
        // Big win!
        // The URL of the image is:
        console.log(xhr.responseText);
        var response = JSON.parse(xhr.responseText);

        if (response.access_token) {
            console.log("Tokens Refreshed");
            imgur.setAuthorizationToken(response.access_token);
            imgur.setRefreshToken(response.refresh_token);
            inCallback(null, response);
        } else {
            console.log("Oops! No Refresh");
            inCallback(response, null);
        }
    }
    xhr.send(fd);

}

imgur.getAuthorizationURL = function() {
    var url = "https://api.imgur.com/oauth2/authorize?client_id="+imgur.config.clientId+"&response_type=token&state=authorizing";

    return url;
};

