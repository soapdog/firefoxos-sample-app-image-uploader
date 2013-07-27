var currentImage;

navigator.mozSetMessageHandler('activity', function(activityRequest) {

    var img = document.createElement("img");
    currentImage = activityRequest.source.data.blobs[0]

    img.src = window.URL.createObjectURL(currentImage);

    // Present that image in your app, so it looks cool.
    var imagePresenter = document.querySelector("#image-presenter");
    imagePresenter.appendChild(img);
});

function uploadImage() {
    alert("uploading");
    imgur.share(currentImage, shareCallback);
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
    var activity = new MozActivity({
        name: "view",
        type: "url",
        url: link
    });
}

function saveLinkToBookmarks() {
    var link = document.querySelector("#link").innerHTML;
    var activity = new MozActivity({
        name: "save-bookmark",
        type: "url",
        url: link
    });
}

function sendLinkByEmail() {
    var link = document.querySelector("#link").innerHTML;
    var activity = new MozActivity({
        name: "new",
        type: "email",
        url: "mailto:?body=" + encodeURIComponent(link) + "&subject=" + encodeURIComponent(link)
    });
    activity.onerror = function() {
        alert("could not send email");
    };
}

// Share screen events
document.querySelector("#upload").addEventListener("click", uploadImage);

// Succesful upload screen events
document.querySelector("#back-to-main").addEventListener("click", function() {
    document.querySelector('#result').className = 'right';
    document.querySelector('[data-position="current"]').className = 'current';
});
document.querySelector("#open").addEventListener("click", openLink);
document.querySelector("#email").addEventListener("click", sendLinkByEmail);
document.querySelector("#bookmark").addEventListener("click", saveLinkToBookmarks);
