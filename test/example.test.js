const { handler: createGame } = require('../createGame/index');

test('test name', async () => {
  const body = JSON.stringify({name: "Michael"});
  const rtrn = await createGame({body});
  console.log(rtrn);
});