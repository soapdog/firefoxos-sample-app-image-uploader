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
     * Todo: make the token refresh work.
     * Obs: thinking about always refreshing...
     */

    var currentImage;
    var webActivity = false;

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



            document.querySelector("#upload").classList.remove("hidden");

            if (checkIfAppIsAuthorized()) {
                var username = imgur.config.username;
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
        document.querySelector("#upload_user").classList.add("hidden");
        document.querySelector("#pick").classList.add("hidden");
        document.querySelector("#uploading").classList.remove("hidden");
        imgur.share(currentImage, true, shareCallback);
    }

    /**
     * This function is called by the "upload as user" button on the main screen. This button
     * is only visible if there was a successful "pick" web activity call or if the application
     * was launched as a web activity handler for the "share" activity.
     *
     * This function hides the "upload" button and the "pick" button (just in case) and displays
     * a progress spinner while the upload is happening. To upload it uses the share() call from
     * imgur.js which accepts an image and a callback. It posts on behalf of the logged user.
     *
     * This button is only visible if the user has authorized the app with imgur (a.k.a. is logged in).
     */
    function uploadCurrentImageToImgurAsTheAuthorizedUser() {
        document.querySelector("#upload").classList.add("hidden");
        document.querySelector("#upload_user").classList.add("hidden");
        document.querySelector("#pick").classList.add("hidden");
        document.querySelector("#uploading").classList.remove("hidden");

        function shareClosure(err, tokens) {
            saveTokens(tokens);
            imgur.share(currentImage, false, shareCallback);
        }

        imgur.refreshAccessToken(shareClosure);
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

        webActivity = activityRequest;

        var img = document.createElement("img");
        currentImage = activityRequest.source.data.blobs[0];

        img.src = window.URL.createObjectURL(currentImage);

        // Present that image in your app, so it looks cool.
        var imagePresenter = document.querySelector("#image-presenter");
        imagePresenter.appendChild(img);

        document.querySelector("#upload").classList.remove("hidden");
        document.querySelector("#cancel_web_activity").classList.remove("hidden");
        document.querySelector("#return_web_activity").classList.remove("hidden");



        if (checkIfAppIsAuthorized()) {
            var username = imgur.config.username;
            console.log("Changing label to " + username);
            document.querySelector("#username").innerHTML = username;
            document.querySelector("#upload_user").classList.remove("hidden");
        }


    });

    function cancelWebActivity() {
        console.log("Canceling web activity");
        webActivity.postError("User cancelled image sharing");
    }

    function returnWebActivity() {
        console.log("Returning web activity");
        webActivity.postResult("Image posted!");
    }

    /**
     * This is the function that requests authorization for the app to post
     * on the behalf of the user on imgur.
     *
     * It uses OAuth 2.0 stuff, I wish this stuff was easier.
     */
    function requestAuthorization() {

        var browser = document.querySelector("#browser");
        var url = imgur.getAuthorizationURL();
        var redirect_uri = "https://imgur.soapdog.org/authorize";

        // move from main screen to authorization screen.
        document.querySelector('#authorize').className = 'current';
        document.querySelector('[data-position="current"]').className = 'left';

        // Clear current tokens...

        console.log("Clearing tokens...");
        window.localStorage.removeItem("tokens");

        console.log("Authorization URL:" + url);

        browser.setAttribute("src", url);

        browser.addEventListener('mozbrowserlocationchange', function(e) { // <--- wish this was a standard event
            console.log("Browser location change: ", e.detail);
            if (e.detail && (e.detail.indexOf(redirect_uri) === 0)) {
                console.log("Found tokens!");
                console.log(e.detail);
                var result = parseTokens(e.detail);
                console.log(result);

                if (result["error"]) {
                    resetTokens();
                    console.log("User denied access, removing tokens");
                } else {
                    saveTokens(result);
                    console.log("Received a OAuth access token of: " + result['access_token']);
                    loadTokens();
                }

                browser.setAttribute("src", "");

                // Tokens received.

                checkIfLoggedIn();

                document.querySelector('#authorize').className = 'right';
                document.querySelector('[data-position="current"]').className = 'current';
            } else {
                console.log("iframe redirected but url contained no tokens...");

            }
        });
    }

    /**
     * This function checks if the user is authorized on imgur based on the presence of a key tokens in
     * localStorage. This key is saved by the callback from the OAuth workflow. Check requestAuthorization().
     * @returns {boolean}
     */
    function checkIfAppIsAuthorized() {
        var tokens = window.localStorage.getItem("tokens");

        if (tokens) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Saves the given tokens to localStorage. This is used by loadTokens() later to load them back into memory
     * @param tokens
     */
    function saveTokens(tokens) {
        var serialized = JSON.stringify(tokens);
        window.localStorage.setItem("tokens", serialized);
    }

    /**
     * This picks the tokens from localStorage and load them into the imgur library
     */
    function loadTokens() {
        var tokens = window.localStorage.getItem("tokens");

        if (tokens) {
            tokens = JSON.parse(tokens);
            imgur.setAccountUsername(tokens.account_username);
            imgur.setAuthorizationToken(tokens.access_token);
            imgur.setRefreshToken(tokens.refresh_token);
        }
    }

    /**
     * Removes the data from local storage effectively logging out the user.
     */
    function resetTokens() {
        window.localStorage.removeItem("tokens");
    }

    /**
     * Utility function to parse OAuth authorization token out of a URL.
     */
    function parseTokens(url) {
        url = url.split("?")[1];
        url = url.replace('#', '&'); // <-- fix for imgur oauth thing.
        var result = {};

        url.split('&').forEach(function(parts) {
            parts = parts.split('=');
            result[parts[0]] = parts[1];
        });
        return result;
    }

    /**
     * This function could have a better name but I can't think of one. This is used to replace the #status_msg with a
     * friendly reminder if you're logged in or not.
     */
    function checkIfLoggedIn() {
        if (checkIfAppIsAuthorized()) {
            console.log("User is authorized, loading tokens...");
            loadTokens();
            document.querySelector("#status_msg").innerHTML = "Authorized as " + imgur.config.username;
        } else {
            console.log("User is not authorized.")
            document.querySelector("#status_msg").innerHTML = "Click the button on the top right corner to authorize your user on imgur.com. if you don't authorize your user then you will only be able to upload anonymously.";
        }
    }

    /**
     *  Firefox OS 2.5+ has addons support. In this version of the app we'll embrace addons by exposing
     *  useful Custom Events that addon writes can listen to and interact with the main app.
     *
     *  Events
     *  ======
     *
     *  requestAdditionalLinkActions: sent when asking for extra buttons/actions for the post-upload screen.
     *  requestAdditionalUploadActions: sent when asking for extra buttons/actions on the upload screen.
     *  beforeImageUpload: sent before uploading the image
     *  afterImageUpload: sent after the image is succesfuly uploaded
     *  imageSelected: sent once an image is selected as a result of "pick" or "share"
     *  imageUploading: sent once when the image is uploading
     *
     */

    /**
     * Creates and dispatches a Custom Event. Addon writers should listen for these events to
     * interact with app.
     * @param eventName
     * @param eventDetails: shared data.
     */
    function createAndDispatchCustomEvent(eventName, eventDetails) {
        var event = new CustomEvent(eventName, { 'detail': eventDetails });

        document.dispatchEvent(event);
    }

    /**
     * Auxiliary function to add extra buttons to the main screen and the after upload screen. This
     * function is shared with addon writers by sending it inside the 'details' for the custom event.
     * @param parentId
     * @param label
     * @param trigger
     */
    function addActionButton(parentId, label, trigger) {
        var button = document.createElement("button");
        button.classList.add("recommend");
        button.innerHTML = label;

        button.addEventListener("click", trigger);

        document.querySelector(parentId).appendChild(button);
    }

    /**
     * Custom Event. Called once to setup additional buttons to the "after upload" screen.
     * The "addActionButton" function is passed as shared data and is used by addon writers to
     * add new actions to that screen.
     */
    function requestAdditionalLinkActions() {
        var sharedData = {
            linkElement: document.querySelector("#link"),
            addActionButton: function(label, trigger) {
                addActionButton("#link-actions", label, trigger);
            }
        };

        createAndDispatchCustomEvent("requestAdditionalLinkActions", sharedData);
    }

    /**
     * Custom Event. Called once to setup additional buttons to the main screen.
     * The "addActionButton" function is passed as shared data and is used by addon writers to
     * add new actions to that screen.
     */
    function requestAdditionalUploadActions() {
        var sharedData = {
            linkElement: document.querySelector("#link"),
            addActionButton: function(label, trigger) {
                addActionButton("#main-screen", label, trigger);
            }
        };

        createAndDispatchCustomEvent("requestAdditionalUploadActions", sharedData);
    }

    /**
     * End of addon support routines.
     */


    /**
     * Below is the initialization code for the app. It basically binds some buttons to their respective functions
     */


// Main screen events
    document.querySelector("#pick").addEventListener("click", pickImage);
    document.querySelector("#upload").addEventListener("click", uploadCurrentImageToImgur);
    document.querySelector("#upload_user").addEventListener("click", uploadCurrentImageToImgurAsTheAuthorizedUser);
    document.querySelector("#cancel_web_activity").addEventListener("click", cancelWebActivity);
    document.querySelector("#return_web_activity").addEventListener("click", returnWebActivity);




// Succesful upload screen events
    document.querySelector("#back-from-authorize").addEventListener("click", function() {
        console.log("Clicked the back button");
        checkIfLoggedIn();
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


// bind events for the successful upload screen
    document.querySelector("#open").addEventListener("click", openLink);
    document.querySelector("#email").addEventListener("click", sendLinkByEmail);
    document.querySelector("#bookmark").addEventListener("click", saveLinkToBookmarks);


    checkIfLoggedIn();

    console.log("application loaded");

}());
