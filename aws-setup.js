const AWS = require("aws-sdk")

const createAwsInstances = () => {
    if (process.argv[2] === "local") {
        return {
            ddb: new AWS.DynamoDB({
                region: "local",
                endpoint: "http://localhost:14222",
                accessKeyId: "local",
                secretAccessKey: "local"
            }),
            ddbStreams: new AWS.DynamoDBStreams({
                region: "local",
                endpoint: "http://localhost:14222",
                accessKeyId: "local",
                secretAccessKey: "local"
            })
        }
    } else {
        return {
            ddb: new AWS.DynamoDB({region: process.env["AWS_DEFAULT_REGION"] || "eu-west-1"}),
            ddbStreams: new AWS.DynamoDBStreams({region: process.env["AWS_DEFAULT_REGION"] || "eu-west-1"})
        }
    }
}

module.exports = createAwsInstances()