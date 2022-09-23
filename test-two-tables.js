const {ddb, ddbStreams} = require("./aws-setup")
const {recreateTable, waitForStreamsReady} = require("./utils")

const main = async () => {
    const [
        {TableDescription: {LatestStreamArn: streamArnFoo}},
        {TableDescription: {LatestStreamArn: streamArnBar}}
    ] = await Promise.all([
        recreateTable(ddb, {
            TableName: "table_test_foo",
            BillingMode: "PAY_PER_REQUEST",
            KeySchema: [
                {AttributeName: "id", KeyType: "HASH"}
            ],
            AttributeDefinitions: [
                {AttributeName: "id", AttributeType: "S"}
            ],
            StreamSpecification: {
                StreamEnabled: true,
                StreamViewType: "NEW_AND_OLD_IMAGES"
            }
        }),
        recreateTable(ddb, {
            TableName: "table_test_bar",
            BillingMode: "PAY_PER_REQUEST",
            KeySchema: [
                {AttributeName: "id", KeyType: "HASH"}
            ],
            AttributeDefinitions: [
                {AttributeName: "id", AttributeType: "S"}
            ],
            StreamSpecification: {
                StreamEnabled: true,
                StreamViewType: "NEW_AND_OLD_IMAGES"
            }
        })
    ])


    await waitForStreamsReady(ddbStreams, streamArnFoo)
    await waitForStreamsReady(ddbStreams, streamArnBar)


    console.log("Setting up TRIM_HORIZON shard iterator...")
    const {StreamDescription: streamDescription} = await ddbStreams.describeStream({StreamArn: streamArnFoo}).promise()
    const shardConsumers = []
    for (const shard of streamDescription.Shards) {
        const {ShardIterator: shardIterator} = await ddbStreams.getShardIterator({
            StreamArn: streamArnFoo, 
            ShardId: shard.ShardId, 
            ShardIteratorType: "TRIM_HORIZON"
        }).promise()

        shardConsumers.push({shardIterator})
    }

    console.log("Putting item...")
    await ddb.putItem({
        TableName: "table_test_foo",
        Item: {
            id: {S: "testItem"}
        }
    }).promise()

    console.log("Waiting to increase chances of item being present in stream...")
    await new Promise(resolve => setTimeout(resolve, 2000))

    console.log("Checking what's in the stream...")
    for (const shardConsumer of shardConsumers) {
        const res = await ddbStreams.getRecords({ShardIterator: shardConsumer.shardIterator}).promise()
        console.log(res.Records.map(it => it.dynamodb.NewImage))
        shardConsumer.shardIterator = res.NextShardIterator
    }
}

main()