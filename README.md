# Serverless Framework Node HTTP API on AWS

This template demonstrates how to make a simple HTTP API with Node.js running on AWS Lambda and API Gateway using the Serverless Framework.

This template does not include any kind of persistence (database). For more advanced examples, check out the [serverless/examples repository](https://github.com/serverless/examples/) which includes Typescript, Mongo, DynamoDB and other examples.

## Usage

### Deployment

Each team must create a branch following the pattern of `training/*`, e.g. `training/the-a-team`. Push this branch to origin and an action will be triggered to deploy an environment for your team.

Navigates to the [actions tab](https://github.com/bitovi/battleship-api/actions) and find the workflow for your branch to see the status of the deployment.

To find the URL of the deployment, navigate to the `deploy` for your workflow and click the dropdown for details about the `serverless deploy` step. After this step runs succesfully, it will print out the URL it deployed to.

### Local development

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

To learn more about the capabilities of `serverless-offline`, please refer to its [GitHub repository](https://github.com/dherault/serverless-offline).

__DynamoDB__

It is possible to emulate DynamoDB locally by using `serverless-dynamodb-local` plugin. In order to do that, execute the following command:

```bash
serverless plugin install -n serverless-dynamodb-local
```

To learn more about the capabilities of `serverless-dynamodb-local`, please refer to its [GitHub repository](https://github.com/99x/serverless-dynamodb-local).
