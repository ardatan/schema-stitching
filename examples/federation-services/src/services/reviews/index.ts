import { reviewsServer } from './server';

reviewsServer.listen(4002, () => {
  console.log(`Reviews service running at http://localhost:4002`);
});
