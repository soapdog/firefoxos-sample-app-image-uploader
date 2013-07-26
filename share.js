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