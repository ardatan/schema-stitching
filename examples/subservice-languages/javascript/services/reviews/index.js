import { reviewsServer } from './server.js';

reviewsServer.listen(4004, () => {
  console.log('Reviews ready at http://localhost:4004/graphql');
});
