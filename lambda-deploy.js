/* jshint
    browser: true, jquery: true, node: true,
    bitwise: true, camelcase: false, curly: true, eqeqeq: true, esversion: 6, evil: true, expr: true, forin: true, immed: true, indent: 4, latedef: true, newcap: true, noarg: true, noempty: true, nonew: true, quotmark: single, regexdash: true, strict: true, sub: true, trailing: true, undef: true, unused: vars, white: true
*/
'use strict';

const archiver = require('archiver');
const aws = require('aws-sdk');
const fs = require('fs-extra');

const archive = archiver.create('zip');
const payload = './deploy.zip';

function promiseToBuildSettings(config) {
    return new Promise((resolve, reject) => {
        console.log('trying to copy config file');
        // Config files for lambda functions are optional.        
        if (!config.config || !config.outputConfig) {
            console.log('\tno config file, skipping');
            resolve();
        }

        var copyOptions = {};
        // Lambda does a binary diff. 
        // This at least lets the same process publish without duplicate versions when the code hasnt changed.
        copyOptions.preserveTimestamps = true;

        fs.copy(config.config, config.outputConfig, copyOptions, (error) => {
            if (error) {
                reject(error);
            } else {
                console.log('\t' + config.config + ' copied to ' + config.outputConfig);
                resolve();
            }
        });
    });
}

function promiseToBuildPayload(config) {
    return new Promise((resolve, reject) => {
        console.log('building payload');

        var output = fs.createWriteStream(payload);
        output.on('close', resolve);

        archive.on('error', reject);
        archive.pipe(output);
        archive
            .directory('./src/', '/')
            .directory('./node_modules', '/node_modules')
            .finalize();
    })
};

function promiseToUpdateFunctionCode(config) {
    return new Promise((resolve, reject) => {
        console.log('updating function code');

        let params = {
            FunctionName: config.functionName,
            ZipFile: fs.readFileSync(payload, { options: { encoding: "base64" } })
        };

        let lambda = new aws.Lambda();

        lambda.publishVersion({ FunctionName: params.FunctionName }, (error, data) => {
            if (error) {
                reject(error);
            } else {
                console.log(`\t$LATEST version saved as snapshot: Version ${data.Version}`);
                lambda.updateFunctionCode(params, (error, data) => {
                    if (error) {
                        reject(error);
                    } else {
                        console.log('successfully updated function code: ');
                        console.log(data);
                        resolve();
                    }
                });
            }
        });
    });
}

function promiseToCleanup(config) {
    return new Promise((resolve, reject) => {
        console.log('cleanup');
        if (payload) {
            fs.unlinkSync(payload);
        }
        if (config.config && config.outputConfig) {
            fs.unlinkSync(config.outputConfig);
        }
        resolve();
    });
}

function deploy(config) {
    console.log(config);

    aws.config.update({ region: config.aws.region });

    promiseToBuildSettings(config)
        .then(() => {
            return promiseToBuildPayload(config)
        }).then(() => {
            return promiseToUpdateFunctionCode(config);
        }).then(() => {
            return promiseToCleanup(config);
        }).catch(error => {
            console.log('DEPLOY FAILED');
            console.log(error);
        });
}

exports.deploy = deploy;