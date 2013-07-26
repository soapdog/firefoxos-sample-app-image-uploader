Imgur Image Uploader App
==========================

A sample app for Firefox OS for uploading images to imgur.


Implementation
==============

## index.html and app.js
Those files have the application that the user can launch and use the **Pick Image and Upload** button to select an
image from some source and upload it to imgur.com

## share.html and share.js
These files are responsible for uploading an image that was shared with an activity of type **share** such as when the
user is on the gallery app and selects share on the viewed image.

## imgur.js
This is a minimal imgur anonymous upload wrapper.


Usage of Web APIs
=================

This application was made to demonstrate the usage of webactivities. It can act as an activity handler for the *share*
activity and it uses the *pick* activity to select images to be uploaded when launched as an app instead of being selected
as an adctivity from the share menu.

You can learn more about [Web Activities here](https://developer.mozilla.org/en-US/docs/WebAPI/Web_Activities)


Google Summer of Code
=====================

This app was created as a part of a collection of sample apps for Firefox OS during Google Summer of Code 2013.
You can check [my original proposal](https://wiki.mozilla.org/SummerOfCode/2013/FirefoxOSSampleApps).