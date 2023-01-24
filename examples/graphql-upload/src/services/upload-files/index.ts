import { uploadFilesServer } from './server';

uploadFilesServer.listen(4001, () => console.log('upload files service running at http://localhost:4001/graphql'));
