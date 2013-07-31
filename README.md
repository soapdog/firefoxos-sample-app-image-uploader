Imgur Image Uploader App
==========================

A sample app for Firefox OS for uploading images to imgur.

It can be used as a standalone app to post pictures to imgur.com as seen in:

![Imgur Uploader](http://andregarzia.com/shots/uploader1.gif)

Or as an activity handler for the share image activity as seen in:

![Imgur Uploader](http://andregarzia.com/shots/uploader2.gif)


Implementation
==============

## index.html, share.html and app.js
Those files have the application that the user can launch and use the **Pick Image and Upload** button to select an
image from some source and upload it to imgur.com. The share.html file is a copy of index.html that is loaded when the user
uses the share activity to send an image from some app to the uploader app. We use this second file because if we use
index.html as our activity handler page and the app is already open, it will simply switch to the app without loading the stuff.


## imgur.js
This is a minimal imgur.com anonymous upload wrapper. The [Imgur API](http://api.imgur.com) is free to use for non-commercial
low volume apps such as this one.


Usage of Web APIs
=================

This application was made to demonstrate the usage of Web Activities. It can act as an activity handler for the *share*
activity and it uses the *pick* activity to select images to be uploaded when launched as an app instead of being selected
as an activity from the share menu.

You can learn more about [Web Activities here](https://developer.mozilla.org/en-US/docs/WebAPI/Web_Activities).

Before trying to upload the image to imgur.com we check if the user is connected using the
[Connection API](https://developer.mozilla.org/en-US/docs/Web/API/window.navigator.connection).

Upon successfully uploading an image to imgur.com, we display a notification using the
[Notification API](https://developer.mozilla.org/en-US/docs/Web/API/notification).


Google Summer of Code
=====================

This app was created as a part of a collection of sample apps for Firefox OS during Google Summer of Code 2013.
You can check [my original proposal](https://wiki.mozilla.org/SummerOfCode/2013/FirefoxOSSampleApps).