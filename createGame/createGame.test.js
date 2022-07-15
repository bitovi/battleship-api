const { handler: createGame } = require('./index');

describe('createGame', () => {
  test('should return happy path values', async () => {
    const body = JSON.stringify({name: "Michael"});
    const result = await createGame({body});

    const resultBody = JSON.parse(result.body);
    console.log({ resultBody }); // TOOD: remove

    expect(result.statusCode).toBe(200);

    expect(typeof resultBody.gameId).toBe('string');
    expect(resultBody.gameId.length).toBeGreaterThan(0);
  })
});

