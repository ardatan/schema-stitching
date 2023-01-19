import { reviewsServer } from './server';

reviewsServer.listen(4004, () => {
  console.log(`Reviews service running at http://localhost:4004`);
});
