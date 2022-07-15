const { handler: createGame } = require('./index');

describe('createGame', () => {
  test('should run', async () => {
    const body = JSON.stringify({name: "Michael"});
    const rtrn = await createGame({body});
    console.log(rtrn);
  })
});

