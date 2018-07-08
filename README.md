# Mobile Web Specialist Certification Course (Tiago Dias)
---
#### _Three Stage Course Material Project - Restaurant Reviews_

## Project Overview

This code is **Stage 1** and bits of **Stage 2**, so far it has :

**Stage 1 :**
* Responsive Layout
* Responsive images
* Restaurants List
* Restaurant Info
* ARIA
* Service Worker basic implementation

**Stage 2 :**
* REST Server using _**fetch**_ instead of _**xhr**_
* Gulp build


**Currently working on:**
* IndexedDB
* Offline capabilities (caches and IndexedDB)


### How to run it?

1. In this folder, start up a simple HTTP server to serve up the site files on your local computer. Python has some simple tools to do this, and you don't even need to know Python. For most people, it's already installed on your computer.

In a terminal, check the version of Python you have: `python -V`. If you have Python 2.x, spin up the server with `python -m SimpleHTTPServer 8000` (or some other port, if port 8000 is already in use.) For Python 3.x, you can use `python3 -m http.server 8000`. If you don't have Python installed, navigate to Python's [website](https://www.python.org/) to download and install the software.

2. With your server running, visit the site: `http://localhost:8000`, and look around for a bit to see what the current experience looks like.
3. Explore the provided code, and start making a plan to implement the required features in three areas: responsive design, accessibility and offline use.
4. Write code to implement the updates to get this site on its way to being a mobile-ready website.



5. As of **Stage 2** the restaurants json object is created on a separate server, the code is [here](https://github.com/tiago-m-dias/mws-restaurant-stage-2)

6. After downloading, to run the server use `node server` on the code folder. The object will be visible at : `http://localhost:1337/restaurants`


### Note about ES6

Most of the code in this project has been written to the ES6 JavaScript specification for compatibility with modern web browsers and future proofing JavaScript code. As much as possible, try to maintain use of ES6 in any additional JavaScript you write.