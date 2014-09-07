var _ = require('underscore');
var utils = require('restberry-utils');


var DEFAULT_ADDRESS = null;  // '127.0.0.1';
var COLOR_BLUE = '\033[34m';
var COLOR_GREEN = '\033[32m';
var COLOR_GREY = '\033[1;37m';
var COLOR_PURPLE = '\033[35m';
var COLOR_RED = '\033[31m';
var COLOR_RESET = '\033[0m';
var COLOR_TURQUISE = '\033[36m';
var COLOR_YELLOW = '\033[33m';
var LOG_SEP = '|';
var METHOD_DELETE = 'DELETE';
var METHOD_GET = 'GET';
var METHOD_POST = 'POST';
var METHOD_PUT = 'PUT';
var PASSWORD_KEY = 'password';
var PASSWORD_REPL = '**********';
var STATUS_SUCCESS_MIN = 200;
var STATUS_SUCCESS_MAX = 300;
var TAG_LEFT = '<';
var TAG_RIGHT = '>';

module.exports = {
    error: function(address, statusCode, msg) {
        _console(COLOR_RED, address, statusCode, msg);
    },

    info: function(part1, part2, msg) {
        _console(COLOR_GREY, part1, part2, msg);
    },

    req: function(req, json) {
        var msg = _logMessageReq(req, json);
        var method = req.method;
        var address = _getReqRemoteAddress(req);
        var color = _getMethodColor(method);
        var url = utils.getReqPath(req);
        _console(color, address, method, url, msg);
    },

    res: function(res, json) {
        var msg = _logMessageRes(res, json);
        var code = res.statusCode;
        var address = _getReqRemoteAddress(res.req);
        if (_isResSuccessful(code)) {
            this.success(address, code, msg);
        } else {
            this.error(address, code, msg);
        }
    },

    success: function(address, code, msg) {
        _console(COLOR_GREEN, address, code, msg);
    },
};

var _console = function() {
    log = _logDate();
    var args = _.toArray(arguments);
    var color = _.first(args);  args = _.rest(args);
    var msg = _.last(args);  args = _.initial(args);
    _.each(args, function(arg) {
        log += _logStep(color, arg) || '';
    });
    log += _logMessage(msg);
    console.log(log);
};

var _logDate = function() {
    return COLOR_RESET + new Date().toISOString() + LOG_SEP;
};

var _logTag = function(tag) {
    if (!tag)  return null;
    return TAG_LEFT + tag + TAG_RIGHT;
};

var _logStep = function(color, step) {
    if (!step)  return null;
    return color + step + COLOR_RESET + LOG_SEP;
};

var _logMessage = function(msg) {
    return (msg ? msg : '');
};

var _logMessageReq = function(req, json) {
    var data = _.clone(json ? json : req.body);
    data = _prepareData(data);
    return _logTag(data);
};

var _logMessageRes = function(res, json) {
    var data = _prepareData(json);
    return _logTag(data);
};

var _getMethodColor = function(method) {
    switch (method) {
        case METHOD_DELETE:
            return COLOR_TURQUISE;
        case METHOD_GET:
            return COLOR_BLUE;
        case METHOD_POST:
            return COLOR_PURPLE;
        case METHOD_PUT:
            return COLOR_YELLOW;
        default:
            return COLOR_GREY;
    }
};

var _getReqRemoteAddress = function(req) {
    if (req.connection && req.connection.remoteAddress) {
        return req.connection.remoteAddress;
    }
    return DEFAULT_ADDRESS;
};

var _prepareData = function(data) {
    data = (data ? data : {});
    data = _replacePassword(data);
    return JSON.stringify(data, null, 2);
};

var _replacePassword = function(data) {
    for (key in data) {
        if (key === PASSWORD_KEY) {
            data[key] = PASSWORD_REPL;
        } else {
            var val = data[key];
            if (_.isObject(val) && !_.isFunction(val)) {
                data[key] = _replacePassword(val);
            }
        }
    }
    return data;
};

var _isResSuccessful = function(code) {
    return code >= STATUS_SUCCESS_MIN && code < STATUS_SUCCESS_MAX;
};
