(function(){
/**
 * Imgur Image Uploader
 *
 * OBJECTIVE
 * To create a standalone image uploader that is also able to be called as an activity handler by other apps.
 *
 * WEB APIs USED
 * - Web Activities calling and handling
 * - Connection API
 * - Notification API
 *
 * Created with JetBrains WebStorm.
 * User: soapdog
 *
 * todo: email sending not working
 */

var currentImage;

/**
 * This function is called by the "Pick Image" button in the main screen.
 * It calls a "pick" web activity to fetch an image.
 *
 * If the pick activity succeeds, then it hides itself and displays the
 * upload button to share the image on imgur.com
 *
 * More information about web activities in:
 *
 * https://hacks.mozilla.org/2013/01/introducing-web-activities/
 *
 */
function pickImage() {

    // Use the 'pick' activity to acquire an image
    var pick = new MozActivity({
        name: "pick",
        data: {
            type: ["image/jpeg", "image/png", "image/jpg"]
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

        if (connection.bandwidth === 0) {
            alert("Please connect to the internet to upload images to imgur.com");
            return;
        }

        document.querySelector("#pick").classList.add("hidden");
        document.querySelector("#upload").classList.remove("hidden");

        if (checkIfAppIsAuthorized()) {
            var username = window.localStorage.getItem("account_username");
            console.log("Changing label to " + username);
            document.querySelector("#username").innerHTML = username;
            document.querySelector("#upload_user").classList.remove("hidden");
        }

        currentImage = this.result.blob;


    };

    pick.onerror = function() {
        // If an error occurred or the user canceled the activity
        alert("Can't view the image!");
    };
}

/**
 * This function is called by the "upload" button on the main screen. This button
 * is only visible if there was a successful "pick" web activity call or if the application
 * was launched as a web activity handler for the "share" activity.
 *
 * This function hides the "upload" button and the "pick" button (just in case) and displays
 * a progress spinner while the upload is happening. To upload it uses the share() call from
 * imgur.js which accepts an image and a callback.
 */
function uploadCurrentImageToImgur() {
    document.querySelector("#upload").classList.add("hidden");
    document.querySelector("#pick").classList.add("hidden");
    document.querySelector("#uploading").classList.remove("hidden");
    imgur.share(currentImage, shareCallback);
}


/**
 * This function is the callback from the imgur.share() call. It receives two parameters,
 * "err" or "response", if there was an error, the first parameter will contain the error and the second
 * parameter will be null, if the upload succeeds, then the first parameter will be null and the second will
 * contain the response.
 *
 * Upon a successful upload, this function displays a notification.
 *
 * @param err
 * @param response
 */
function shareCallback(err, response) {
    console.log("callback from upload to imgur", response);

    document.querySelector("#pick").classList.remove("hidden");
    document.querySelector("#uploading").classList.add("hidden");
    document.querySelector("#upload").classList.add("hidden");

    if (!err) {
        document.querySelector("#link").innerHTML = response.data.link;
        document.querySelector('#result').className = 'current';
        document.querySelector('[data-position="current"]').className = 'left';

        // also add a notification
        var notification = navigator.mozNotification.createNotification(
            "Imgur Uploader",
            "Image upload succeeded: " + response.data.link
        );
        notification.show();
        return;

    }

    alert("could not upload your image");

}

/**
 * Below are some functions related to calling web activities. These are triggered by buttons
 * that are displayed when a succesful upload is achieved.
 *
 * Web Activites allow your app to delegate functionality to other apps (aka pig back on other people
 * works :-) ).
 *
 * You can learn more about Web Activities at:
 *
 * - https://hacks.mozilla.org/2013/01/introducing-web-activities/
 * - https://developer.mozilla.org/en-US/docs/WebAPI/Web_Activities
 *
 */


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

/**
 * This is the function responsive for handling the "share" activity call. This will be called
 * when some other app invokes the share web activity and the user selects this app.
 *
 * It will pick and load the image and display the upload button.
 */
navigator.mozSetMessageHandler('activity', function(activityRequest) {

    var img = document.createElement("img");
    currentImage = activityRequest.source.data.blobs[0];

    img.src = window.URL.createObjectURL(currentImage);

    // Present that image in your app, so it looks cool.
    var imagePresenter = document.querySelector("#image-presenter");
    imagePresenter.appendChild(img);

    document.querySelector("#pick").classList.add("hidden");
    document.querySelector("#upload").classList.remove("hidden");



});

function requestAuthorization() {

    var browser = document.querySelector("#browser");
    var url = imgur.getAuthorizationURL();
    var redirect_uri = "https://imgur.soapdog.org/authorize";

    // move from main screen to authorization screen.
    document.querySelector('#authorize').className = 'current';
    document.querySelector('[data-position="current"]').className = 'left';

    // Clear current tokens...

    console.log("Clearing tokens...");
    window.localStorage.removeItem("access_token");
    window.localStorage.removeItem("refresh_token");
    window.localStorage.removeItem("username");

    console.log(url);

    browser.setAttribute("src", url);

    browser.addEventListener('mozbrowserlocationchange', function(e) {
        console.log("Browser location change: ", e.detail);
        if (e.detail && (e.detail.indexOf(redirect_uri) === 0)) {
            console.log("Found tokens!");
            console.log(e.detail);
            var result = parseTokens(e.detail);
            console.log(result);
            var tokens = JSON.stringify(result);
            console.log(tokens);
            window.localStorage.setItem("access_token", result['access_token']);
            window.localStorage.setItem("refresh_token", result['refresh_token']);
            window.localStorage.setItem("account_username", result['account_username']);
            console.log("Received a OAuth access token of: " + result['access_token']);
            browser.setAttribute("src", "");

            // Tokens received.

            document.querySelector('#authorize').className = 'right';
            document.querySelector('[data-position="current"]').className = 'current';
        } else {
            console.log("iframe redirected but url contained no tokens...");

        }
    });
}

function checkIfAppIsAuthorized() {
    var username = window.localStorage.getItem("account_username");

    if (username) {
        return true;
    } else {
        return false;
    }
}

/**
 * Utility function to parse OAuth authorization token out of a URL.
 */
function parseTokens(url) {
    url = url.replace('#', '&'); // <-- fix for imgur oauth thing.
    var result = {};

    url.split('&').forEach(function(parts) {
        parts = parts.split('=');
        result[parts[0]] = parts[1];
    });
    return result;
}

    /**
 * Below is the initialization code for the app. It basically binds some buttons to their respective functions
 */


// Main screen events
document.querySelector("#pick").addEventListener("click", pickImage);
document.querySelector("#upload").addEventListener("click", uploadCurrentImageToImgur);


// Succesful upload screen events
document.querySelector("#back-from-authorize").addEventListener("click", function() {
    console.log("Clicked the back button");
    document.querySelector('#browser').className = 'right';
    document.querySelector('[data-position="current"]').className = 'current';
});

// bind back button from authorize screen
    document.querySelector("#back-from-result").addEventListener("click", function() {
        console.log("Clicked the back button");
        document.querySelector('#result').className = 'right';
        document.querySelector('[data-position="current"]').className = 'current';
    });

// Authorize user on imgur.com
document.querySelector("#authorize-button").addEventListener("click", requestAuthorization);



document.querySelector("#open").addEventListener("click", openLink);
document.querySelector("#email").addEventListener("click", sendLinkByEmail);
document.querySelector("#bookmark").addEventListener("click", saveLinkToBookmarks);


checkIfAppIsAuthorized();

console.log("application loaded");


}());