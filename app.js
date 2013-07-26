/**
 * Created with JetBrains WebStorm.
 * User: soapdog
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

        imgur.share(this.result.blob);


    };

    pick.onerror = function () { 
        // If an error occurred or the user canceled the activity
        alert("Can't view the image!");
    };
}

function uploadSuccess(response) {
    document.querySelector("#")
}

document.querySelector("#upload").addEventListener("click", pickImageAndUpload);

console.log("application loaded");
