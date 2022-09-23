// Ensures a table is fully deleted and fully created from scratch
const recreateTable = async (ddb, tableSpec) => {
    try {
        console.log(`Deleting table ${tableSpec.TableName}...`)
        await ddb.deleteTable({
            TableName: tableSpec.TableName
        }).promise()


        console.log(`Waiting for deletion of ${tableSpec.TableName}...`)

        while (true) {
            await ddb.describeTable({TableName: tableSpec.TableName}).promise()
            await new Promise(resolve => setTimeout(resolve, 1000))
        }
    } catch (e) {
        if (e.code === "ResourceNotFoundException") {
            // All good, move on
        } else {
            throw e
        }
    }

    console.log(`Creating table ${tableSpec.TableName}...`)
    return await ddb.createTable(tableSpec).promise()
}

// Resolves when a g iven stream ARN is status ENABLED
const waitForStreamsReady = async (ddbStreams, streamArn) => {
    while (true) {
        const {StreamDescription: stream} = await ddbStreams.describeStream({StreamArn: streamArn}).promise()
        if (stream.StreamStatus !== "ENABLED") {
            console.log(`Stream not enabled yet (is ${stream.StreamStatus}), retrying...`)
            await new Promise(resolve => setTimeout(resolve, 1000))
            continue
        }

        break
    }

    console.log("Streams are ready!")
}

module.exports = {
    recreateTable,
    waitForStreamsReady
}