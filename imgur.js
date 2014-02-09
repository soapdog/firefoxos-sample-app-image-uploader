/**
 * Mininal Imgur API Wrapper
 *
 */

var imgur = imgur || {};

imgur.config = {
    clientId: "226dd8effca185e"
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
imgur.share = function(file, inCallback) {

    var fd = new FormData();
    fd.append("image", file); // Append the file
    fd.append("type", "file"); // Append the file


    // Create the XHR (Cross-Domain XHR FTW!!!)
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.imgur.com/3/image.json"); // Boooom!
    xhr.setRequestHeader("Authorization", "Client-ID 226dd8effca185e");
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
    xhr.send(fd);
}

imgur.getAuthorizationURL = function() {
    var url = "https://api.imgur.com/oauth2/authorize?client_id="+imgur.config.clientId+"&response_type=token&state=authorizing";

    return url;
};