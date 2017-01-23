#! /usr/bin/env node
/* jshint
    browser: true, jquery: true, node: true,
    bitwise: true, camelcase: false, curly: true, eqeqeq: true, esversion: 6, evil: true, expr: true, forin: true, immed: true, indent: 4, latedef: true, newcap: true, noarg: true, noempty: true, nonew: true, quotmark: single, regexdash: true, strict: true, sub: true, trailing: true, undef: true, unused: vars, white: true
*/
'use strict';

const parseArgs = require('minimist')(process.argv.slice(2));
const lambdaDeploy = require('./lambda-deploy');

if (parseArgs['config']) {
    if (typeof parseArgs['config'] !== 'string') {
        throw ('invalid config');
    }
    var cwd = process.cwd();
    const config = require(`${cwd}/${parseArgs['config']}`);
    lambdaDeploy.deploy(config);
} else {
    throw ('invalid config');
}