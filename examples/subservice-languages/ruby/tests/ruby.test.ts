import { ChildProcessWithoutNullStreams, execSync, spawn } from 'child_process';
import { join } from 'path';
import { killPortProcess } from 'kill-port-process';
import { gatewayApp } from '../gateway';

describe('Ruby subservices', () => {
  let servicesProcess: ChildProcessWithoutNullStreams;
  const baseDir = join(__dirname, '..');
  beforeAll(async () => {
    execSync('bundle install', {
      cwd: baseDir,
    });
    servicesProcess = spawn('npm', ['run', 'start-services'], {
      cwd: baseDir,
    });
  });
  afterAll(async () => {
    servicesProcess.stdout.destroy();
    servicesProcess.stderr.destroy();
    servicesProcess.kill();
    await killPortProcess([4001, 4002, 4003]);
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
