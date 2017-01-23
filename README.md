#lambda-deploy
A lightweight module that is configuration file based and removes as much boiler plate code as possible for deploying lambda functions to AWS.

usage
-----
The source must be in ./src/

cli
```
lambda-deploy --config deploy-config.json
```

package.json
```json
  "scripts": {
    "deploy-test": "lambda-deploy --config deploy-config.test.json",
    "deploy": "lambda-deploy --config deploy-config.json"
  },
```
see [sample/sample-config.json](sample/sample-config.json) for a sample configuration file

```json
{
    "functionName": "test-lambda-deploy",
    "config": "config.test.json",       // if omitted, no updates are made to the config file
    "outputConfig": "src/config.json",  // if omitted, no updates are made to the config file
    "aws": {
        "profile": "default",
        "region": "us-east-1"
    }
}
```

install
-------
```
npm install --save-dev lambda-deploy
```
