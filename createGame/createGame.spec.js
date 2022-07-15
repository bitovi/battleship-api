const createGame = require('./index');


// Need to do something to mock out the dynamodb thing
jest.mock('../helpers/dynamodb');
describe("Create Game Suite", () => {

    it('should create a basic game', async () => {
        const event = {
            body: JSON.stringify({
                gridSize: 10,
                name: "test"
            })
        };
        const result = await createGame.handler(event);
        console.log(result);
        expect(result).toBeTruthy();
        expect(result).not.toHaveProperty('error')
    });

})