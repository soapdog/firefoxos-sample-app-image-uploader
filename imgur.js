var imgur = imgur || {};

imgur.share = function(file, inCallback) {
    // file is from a <input> tag or from Drag'n Drop
    // Is the file an image?

    //if (!file || !file.type.match(/image.*/)) return;

    // It is!
    // Let's build a FormData object

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
    // Ok, I don't handle the errors. An exercice for the reader.
    // And now, we send the formdata
    xhr.send(fd);
}