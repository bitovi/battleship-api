
const dynamoStorage = {};

const dynamoClient = {
    put: ({ TableName, Item }) => {
        if (!dynamoStorage[TableName]) {
            dynamoStorage[TableName] = {};
        }
        dynamoStorage[TableName][Item.id] = Item;
    },
    get: ({ TableName, Key }) => {
        if (!dynamoStorage[TableName]) {
            return null;
        }

        if (!Key) {
            return null;
        }

        if (!Key.id) {
            return null;
        }

        return { Item: dynamoStorage[TableName][Key.id] }
    }
}

module.exports = { dynamoClient }