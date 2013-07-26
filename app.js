/**
 * Created with JetBrains WebStorm.
 * User: soapdog
 */

navigator.mozSetMessageHandler('activity', function(activityRequest) {
    var option = activityRequest.source;

    console.log(activityRequest);

    if (option.name === "share") {
        // Do something to handle the activity

        // Send back the result
        if (picture) {
            activityRequest.postResult(picture);
        } else {
            activityRequest.postError("Unable to provide a picture");
        }
    }
});

function pickImageAndUpload() {
    var pick = new MozActivity({
        name: "pick",
        data: {
            type: ["image/png", "image/jpg", "image/jpeg"]
         }
    });

    pick.onsuccess = function () { 
        // Create image and set the returned blob as the src
        var img = document.createElement("img");

        img.src = window.URL.createObjectURL(this.result.blob);

        // Present that image in your app
        var imagePresenter = document.querySelector("#image-presenter");
        imagePresenter.appendChild(img);

        imgur.share(this.result.blob);


    };

    pick.onerror = function () { 
        // If an error occurred or the user canceled the activity
        alert("Can't view the image!");
    };
}

document.querySelector("#upload").addEventListener("click", pickImageAndUpload);

console.log("loaded");
