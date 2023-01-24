import { usersServer } from './server';

usersServer.listen(4003, () => {
  console.log(`Users service running at http://localhost:4003`);
});
