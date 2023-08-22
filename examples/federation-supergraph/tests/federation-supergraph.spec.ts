import { exampleQuery } from '../src/example-query';
import { exampleSubscription } from '../src/example-subscription';
import { yoga } from '../src/gateway';
import { server as accountsServer } from '../src/services/accounts';
import { server as inventoryServer } from '../src/services/inventory';
import { server as productsServer } from '../src/services/products';
import { server as reviewsServer } from '../src/services/reviews';

describe('federation-supergraph', () => {
  afterAll(() => {
    accountsServer.close();
    inventoryServer.close();
    productsServer.close();
    reviewsServer.close();
  });

  it('should pass', async () => {
    const res = await yoga.fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: exampleQuery,
      }),
    });
    const result = await res.json();
    expect(result).toMatchSnapshot();
  });

  it('subscriptions', async () => {
    const res = await yoga.fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({
        query: exampleSubscription,
      }),
    });
    const reader = res.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      const str = Buffer.from(value).toString('utf-8');
      const [, actualJson] = str.split('data: ');
      if (actualJson) {
        const res = JSON.parse(actualJson);
        expect(res.errors).toBeUndefined();
        expect(res.data).toMatchSnapshot();
      }
    }
  });
});
