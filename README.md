# Serverless Framework Node HTTP API on AWS

This template demonstrates how to make a simple HTTP API with Node.js running on AWS Lambda and API Gateway using the Serverless Framework.

This template does not include any kind of persistence (database). For more advanced examples, check out the [serverless/examples repository](https://github.com/serverless/examples/) which includes Typescript, Mongo, DynamoDB and other examples.

## Usage

### Deployment

Each team must create a branch following the pattern of `training/*`, e.g. `training/the-a-team`. Push this branch to origin and an action will be triggered to deploy an environment for your team.

Navigates to the [actions tab](https://github.com/bitovi/battleship-api/actions) and find the workflow for your branch to see the status of the deployment.

To find the URL of the deployment, navigate to the `deploy` for your workflow and click the dropdown for details about the `serverless deploy` step. After this step runs succesfully, it will print out the URL it deployed to.

### Local development

_Note: you must install serverless globally to use `serverless` or `sls` commands:_

```bash
npm i -g serverless
```

You can invoke your function locally by using the following command:

```bash
serverless invoke local --function hello
```

Which should result in response similar to the following:

```
{
  "statusCode": 200,
  "body": "{\n  \"message\": \"Go Serverless v3.0! Your function executed successfully!\",\n  \"input\": \"\"\n}"
}
```

### AWS emulation

__DynamoDB__

_Note: There is a known issue running this plugin on Node version 17 and above._

It is possible to emulate DynamoDB locally by using `serverless-dynamodb-local` plugin. In order to do that, follow these steps:

Run `sls plugin install -n serverless-dynamodb-local`

Then run `sls dynamodb install`

Add the following to the `serverless.yml`:
```yaml
custom:
  dynamodb:
    stages:
      - dev
    start:
      port: 8000
      inMemory: true
      heapInitial: 200m
      heapMax: 1g
      migrate: true
      seed: true
      convertEmptyValues: true
```

You can start local DynamoDB by itself by running `sls dynamodb start`

_Note: You may encounter an `spawn java ENOENT` error, you may need to manually install the Java SDK_

To learn more about the capabilities of `serverless-dynamodb-local`, please refer to its [GitHub repository](https://github.com/99x/serverless-dynamodb-local).


__API Gateway and Lambda__

It is possible to emulate API Gateway and Lambda locally by using `serverless-offline` plugin. In order to do that, execute the following command:

```bash
serverless plugin install -n serverless-offline
```

It will add the `serverless-offline` plugin to `devDependencies` in `package.json` file as well as will add it to `plugins` in `serverless.yml`.

After installation, you can start local emulation with:

```
serverless offline
```

_Note: this should automatically startup local DynamoDB, but seems to be inconsistent so you may need to run it seperately_

To learn more about the capabilities of `serverless-offline`, please refer to its [GitHub repository](https://github.com/dherault/serverless-offline).

### Usage with Docker

There is a Dockerfile in the repo that will provide a consistent development environment.

Run this command to build and run the app using Docker:

```
docker compose up --build
```

To stop everything, run:

```
docker compose down -v
```