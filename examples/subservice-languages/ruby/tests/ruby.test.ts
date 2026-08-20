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
      stdio: 'inherit',
    });
    servicesProcess = spawn('npm', ['run', 'start-services'], {
      cwd: baseDir,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    servicesProcess.stdout?.pipe(process.stdout, { end: false });
    servicesProcess.stderr?.pipe(process.stderr, { end: false });
  }, 120_000);
  afterAll(async () => {
    servicesProcess?.kill('SIGTERM');
    await killPortProcess([4001, 4002, 4003]).catch(() => undefined);
  }, 30_000);
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
  }, 60_000);
});
