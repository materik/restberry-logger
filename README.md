Restberry-Logger
================

Logger class for HTTP requests and responses. Color coded for UNIX console.

## Install

```
npm install restberry-logger
```

## Usage

```
var logger = require('restberry-logger');

var req = ... // request object from for example express
logger.request(req);
//2014-05-09T19:58:41.726Z|172.16.122.129|POST|</api/v1/foo> <{
//    "name": "bar"
//}

var res = ... // response object from for example express
var json = ... // the json object to return
logger.response(req, json);
//2014-05-09T19:58:41.732Z|172.16.122.129|201|<{
//  "foo": {
//    "href": "/api/v1/teams/536d3371f927a55164ba1911",
//    "id": "536d3371f927a55164ba1911",
//    "name": "bar",
//  }
//}>
```
