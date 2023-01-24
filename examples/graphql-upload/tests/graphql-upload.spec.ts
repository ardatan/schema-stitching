import { gatewayApp } from '../src/gateway';
import { resizeImagesServer } from '../src/services/resize-images/server';
import { uploadFilesServer } from '../src/services/upload-files/server';

describe('GraphQL Upload', () => {
  beforeAll(async () => {
    await Promise.all([
      new Promise<void>(resolve => uploadFilesServer.listen(4001, resolve)),
      new Promise<void>(resolve => resizeImagesServer.listen(4002, resolve)),
    ]);
  });
  afterAll(async () => {
    await Promise.all([
      new Promise(resolve => uploadFilesServer.close(resolve)),
      new Promise(resolve => resizeImagesServer.close(resolve)),
    ]);
  });
  it('should read the file and resize the image correctly', async () => {
    const response = await gatewayApp.fetch('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: /* GraphQL */ `
          query {
            readFile(name: "yoga.png") {
              name
              type
              resizedBase64(width: 720, height: 405)
            }
          }
        `,
      }),
    });
    const result = await response.json();
    expect(result).toMatchSnapshot('readFile');
  });
  it('should forward file uploads correctly', async () => {
    const formData = new gatewayApp.fetchAPI.FormData();
    formData.append(
      'operations',
      JSON.stringify({
        query: /* GraphQL */ `
          mutation ($file: File!) {
            uploadFile(file: $file) {
              name
              type
              text
            }
          }
        `,
        variables: {
          file: null,
        },
      })
    );
    formData.append(
      'map',
      JSON.stringify({
        0: ['variables.file'],
      })
    );
    const file = new gatewayApp.fetchAPI.File(['test file but not image'], 'file.txt', { type: 'text/plain' });
    formData.append('0', file);
    const response = await gatewayApp.fetch('/graphql', {
      method: 'POST',
      body: formData,
    });
    const result = await response.json();
    expect(result).toMatchSnapshot('uploadFile');
  });
});
