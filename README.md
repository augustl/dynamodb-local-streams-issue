# DynamoDB Local streams issue

Hi, AWS team :) 

This repo demonstrates an inconsistency between DynamoDB proper and DynamoDB local.

## Running tests

* Run `npm install`
* Run `docker compose up -d` to start DynamoDB local on port 14222
* To execute locally, run `node test-<name>.js local`
* To execute on AWS, run `node test-<name>.js`, or if you need to override credentials, `AWS_PROFILE=<profile> AWS_DEFAULT_REGION=<region> node test-<name>.js`

On my machine, test-single-table.js always works on both local and on AWS. 

But, test-two-tables.js always works on AWS but always fails locally.

My layperson impression is that for some reason, the presence of a second table with streams enabled, somehow causes streams on the first table to stop working. That's the case even if I don't use the second table for anything. The mere presence of the second table seems to make local blow up.

This is the error I get when running test-two-tables.js against local:

```
Deleting table table_test_foo...
Deleting table table_test_bar...
Waiting for deletion of table_test_foo...
Waiting for deletion of table_test_bar...
Creating table table_test_foo...
Creating table table_test_bar...
Streams are ready!
Streams are ready!
Setting up TRIM_HORIZON shard iterator...
Putting item...
Waiting to increase chances of item being present in stream...
Checking what's in the stream...
/Users/augustl/code/dynamodb-local-streams-issue/node_modules/aws-sdk/lib/protocol/json.js:52
  resp.error = util.error(new Error(), error);
                          ^

TrimmedDataAccessException: The operation attempted to read past the oldest stream record in a shard.
    at Request.extractError (/Users/augustl/code/dynamodb-local-streams-issue/node_modules/aws-sdk/lib/protocol/json.js:52:27)
    at Request.callListeners (/Users/augustl/code/dynamodb-local-streams-issue/node_modules/aws-sdk/lib/sequential_executor.js:106:20)
    at Request.emit (/Users/augustl/code/dynamodb-local-streams-issue/node_modules/aws-sdk/lib/sequential_executor.js:78:10)
    at Request.emit (/Users/augustl/code/dynamodb-local-streams-issue/node_modules/aws-sdk/lib/request.js:686:14)
    at Request.transition (/Users/augustl/code/dynamodb-local-streams-issue/node_modules/aws-sdk/lib/request.js:22:10)
    at AcceptorStateMachine.runTo (/Users/augustl/code/dynamodb-local-streams-issue/node_modules/aws-sdk/lib/state_machine.js:14:12)
    at /Users/augustl/code/dynamodb-local-streams-issue/node_modules/aws-sdk/lib/state_machine.js:26:10
    at Request.<anonymous> (/Users/augustl/code/dynamodb-local-streams-issue/node_modules/aws-sdk/lib/request.js:38:9)
    at Request.<anonymous> (/Users/augustl/code/dynamodb-local-streams-issue/node_modules/aws-sdk/lib/request.js:688:12)
    at Request.callListeners (/Users/augustl/code/dynamodb-local-streams-issue/node_modules/aws-sdk/lib/sequential_executor.js:116:18) {
  code: 'TrimmedDataAccessException',
  time: 2022-09-23T21:10:30.937Z,
  requestId: '05ce3419-2099-448b-a426-168bf7f16b5d',
  statusCode: 400,
  retryable: false,
  retryDelay: 74.03921752282257
}
```