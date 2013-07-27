/**
 * Created with JetBrains WebStorm.
 * User: soapdog
 *
 * todo: add connection API support
 */

function pickImageAndUpload() {

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
        imagePresenter.appendChild(img);

        imgur.share(this.result.blob, shareCallback);


    };

    pick.onerror = function () { 
        // If an error occurred or the user canceled the activity
        alert("Can't view the image!");
    }
}

function shareCallback(err, response) {
    if (!err) {
        document.querySelector("#link").innerHTML = response.data.link
        document.querySelector('#result').className = 'current';
        document.querySelector('[data-position="current"]').className = 'left';
    } else {
        alert("could not upload your image");
    }
}

function openLink() {
    var link = document.querySelector("#link").innerHTML;
    var activity = new mozActivity({
        name: "view",
        type: "url",
        url: link
    });
}

function saveLinkToBookmarks() {
    var link = document.querySelector("#link").innerHTML;
    var activity = new mozActivity({
        name: "save-bookmark",
        type: "url",
        url: link
    });
}

function sendLinkByEmail() {
    var link = document.querySelector("#link").innerHTML;
    var activity = new mozActivity({
        name: "new",
        type: "email",
        url: "mailto:?body=" + encodeURIComponent(link) + "&subject=" + encodeURIComponent(link)
    });
    activity.onerror = function (e) {
        alert("could not send email");
    };
}


// Main screen events
document.querySelector("#upload").addEventListener("click", pickImageAndUpload);

// Succesful upload screen events
document.querySelector("#back-to-main").addEventListener("click", function() {
    document.querySelector('#result').className = 'right';
    document.querySelector('[data-position="current"]').className = 'current';
});
document.querySelector("#open").addEventListener("click", openLink);
document.querySelector("#email").addEventListener("click", sendLinkByEmail);
document.querySelector("#bookmark").addEventListener("click", saveLinkToBookmarks);




console.log("application loaded");
