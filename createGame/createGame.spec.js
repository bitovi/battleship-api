const createGame = require('./index');


// Need to do something to mock out the dynamodb thing

describe("Create Game Suite", () => {

    it('should create a basic game', () => {
        const event = {
            body: {
                gridSize: 10,
                name: "test"
            }
        };
        const result = createGame.handler(event);
        expect(result).toBeTruthy();
        expect(result).not.toHaveProperty('error')
    });

})