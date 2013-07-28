/**
 * Created with JetBrains WebStorm.
 * User: soapdog
 *
 * todo: email sending not working
 * todo: fix activities in share.js
 * todo: try to remove duplicate code from share.js and app.js
 */

var currentImage;


function pickImage() {

    // Use the 'pick' activity to acquire an image
    var pick = new MozActivity({
        name: "pick",
        data: {
            type: ["image/png", "image/jpg", "image/jpeg"]
         }
    });

    pick.onsuccess = function () { 
        // Pick the returned image blob and upload to imgur.com
        var img = document.createElement("img");

        img.src = window.URL.createObjectURL(this.result.blob);

        // Present that image in your app, so it looks cool.
        var imagePresenter = document.querySelector("#image-presenter");
        imagePresenter.innerHTML = "";
        imagePresenter.appendChild(img);

        // Check connection before upload.
        var connection = window.navigator.mozConnection;

        if (connection.bandwidth == 0) {
            alert("Please connect to the internet to upload images to imgur.com");
            return;
        }

        document.querySelector("#pick").classList.add("hidden");
        document.querySelector("#upload").classList.remove("hidden");

        currentImage = this.result.blob;


    };

    pick.onerror = function() {
        // If an error occurred or the user canceled the activity
        alert("Can't view the image!");
    }
}

function uploadCurrentImageToImgur() {
    document.querySelector("#upload").classList.add("hidden");
    document.querySelector("#pick").classList.add("hidden");
    document.querySelector("#uploading").classList.remove("hidden");
    imgur.share(currentImage, shareCallback);
}

function shareCallback(err, response) {
    console.log("callback from upload to imgur", response);

    document.querySelector("#pick").classList.remove("hidden");
    document.querySelector("#uploading").classList.add("hidden");
    document.querySelector("#upload").classList.add("hidden");

    if (!err) {
        document.querySelector("#link").innerHTML = response.data.link
        document.querySelector('#result').className = 'current';
        document.querySelector('[data-position="current"]').className = 'left';

        // also add a notification
        var notification = navigator.mozNotification.createNotification(
            "Imgur Uploader",
            "Image upload succeeded: " + response.data.link
        );
        notification.show();

    } else {
        alert("could not upload your image");
    }
}

function openLink() {
    var link = document.querySelector("#link").innerHTML;
    console.log("link", link);
    var activity = new MozActivity({
        name: "view",
        data: {
            type: "url",
            url: link
        }
    });
}

function saveLinkToBookmarks() {
    var link = document.querySelector("#link").innerHTML;
    var activity = new MozActivity({
        name: "save-bookmark",
        data: {
            type: "url",
            url: link
        }
    });
}

function sendLinkByEmail() {
    var link = document.querySelector("#link").innerHTML;
    var activity = new MozActivity({
        name: "new",
        data: {
            type: "email",
            url: "mailto:?body=" + encodeURIComponent(link) + "&subject=" + encodeURIComponent(link)
        }
    });
    activity.onerror = function() {
        alert("could not send email");
    };
}

// Share activity handler
navigator.mozSetMessageHandler('activity', function(activityRequest) {

    var img = document.createElement("img");
    currentImage = activityRequest.source.data.blobs[0]

    img.src = window.URL.createObjectURL(currentImage);

    // Present that image in your app, so it looks cool.
    var imagePresenter = document.querySelector("#image-presenter");
    imagePresenter.appendChild(img);
});




// Main screen events
document.querySelector("#pick").addEventListener("click", pickImage);
document.querySelector("#upload").addEventListener("click", uploadCurrentImageToImgur);


// Succesful upload screen events
document.querySelector("#back-to-main").addEventListener("click", function() {
    document.querySelector('#result').className = 'right';
    document.querySelector('[data-position="current"]').className = 'current';
});
document.querySelector("#open").addEventListener("click", openLink);
document.querySelector("#email").addEventListener("click", sendLinkByEmail);
document.querySelector("#bookmark").addEventListener("click", saveLinkToBookmarks);


console.log("application loaded");
