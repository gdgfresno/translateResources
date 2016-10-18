# translateResources
Translate resources.json with Google Translate. resources.json is just a dictionary, a set of key value pairs.
The value parts will be translated one by one. The app performs simple calls, no API is used, no credentials needed or anything.

# Quick Start Example: conversion to Spanish (es)

1. Clone this repo
2. Place `resources.json` into the app folder
3. `npm install`
4. `node app.js`
5. In the browser: `http://localhost:4001/translate/?lang=es`
6. Pick up `resources.es.json` from app folder and copy to `hoverboard/data/es/resources.json`
7. Add new language to the hoverboard config
