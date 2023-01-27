import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { join } from 'path';
import { gatewayApp } from '../gateway';

describe('Ruby subservices', () => {
  let servicesProcess: ChildProcessWithoutNullStreams;
  beforeAll(async () => {
    servicesProcess = spawn('npm', ['run', 'start-services'], {
      cwd: join(__dirname, '..'),
    });
  });
  afterAll(() => {
    servicesProcess.stdout.destroy();
    servicesProcess.stderr.destroy();
    servicesProcess.kill();
  });
  it('should work', async () => {
    const result = await gatewayApp.fetch('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: /* GraphQL */ `
          query {
            users(ids: ["1", "2"]) {
              id
              name
              username
              reviews {
                body
                product {
                  name
                }
              }
            }
          }
        `,
      }),
    });
    const json = await result.json();
    expect(json).toMatchSnapshot('result');
  });
});
