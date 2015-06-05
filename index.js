var _ = require('underscore');
var colors = require('colors');
var utils = require('restberry-utils');

var LOG_SEP = '|';
var PASSWORD_KEY = 'password';
var PASSWORD_REPL = '**********';
var STATUS_SUCCESS_MIN = 200;
var STATUS_SUCCESS_MAX = 300;

var date = function() {
    return colors.grey(new Date().toISOString());
};

var isResSuccessful = function(code) {
    return code >= STATUS_SUCCESS_MIN && code < STATUS_SUCCESS_MAX;
};

var methodColor = function(method) {
    switch (method) {
        case utils.httpMethod.DELETE:
            return colors.cyan;
        case utils.httpMethod.GET:
            return colors.blue;
        case utils.httpMethod.POST:
            return colors.magenta;
        case utils.httpMethod.PUT:
            return colors.yellow;
        default:
            return colors.grey;
    }
};

var remoteAddressOfReq = function(req) {
    if (req.connection && req.connection.remoteAddress) {
        return req.connection.remoteAddress;
    }
    return undefined;
};

var replacePassword = function(data) {
    for (var key in data) {
        if (key === PASSWORD_KEY) {
            data[key] = PASSWORD_REPL;
        } else {
            var val = data[key];
            if (_.isObject(val) && !_.isFunction(val)) {
                data[key] = replacePassword(val);
            }
        }
    }
    return data;
};

module.exports = logger = {

    error: function() {
        var args = _.toArray(arguments);
        args.unshift(colors.red);
        logger.log.apply(this, args);
    },

    info: function(part1, part2, msg) {
        var args = _.toArray(arguments);
        args.unshift(colors.white.bold);
        logger.log.apply(this, args);
    },

    log: function(color) {
        var args = _.rest(_.toArray(arguments));
        var msg = args.pop();
        if (_.isObject(msg)) {
            msg = replacePassword(msg);
            msg = JSON.stringify(msg, undefined, 2);
        }
        var logs = _.map(args, function(arg) {
            return arg && color(arg);
        });
        logs.unshift(date());
        logs.push(msg);
        logs = _.filter(logs, function(log) {
            return !!log;
        });
        var log = logs.join(colors.white(LOG_SEP));
        console.log(log);
    },

    req: function(req, json) {
        json = json || req.body;
        var method = req.method;
        var address = remoteAddressOfReq(req);
        var color = methodColor(method);
        var url = utils.getReqPath(req);
        logger.log(color, address, method, url, json);
    },

    res: function(res, json) {
        json = json || res._body;
        var code = res.statusCode;
        var address = remoteAddressOfReq(res.req);
        if (isResSuccessful(code)) {
            logger.success(address, code, json);
        } else {
            logger.error(address, code, json);
        }
    },

    success: function(address, code, msg) {
        var args = _.toArray(arguments);
        args.unshift(colors.green);
        logger.log.apply(this, args);
    },

};
