import { createWriteStream, promises as fsPromises } from 'fs';
import { createServer } from 'http';
import { join } from 'path';
import { Readable } from 'stream';
import { GraphQLSchema } from 'graphql';
import { createSchema, createYoga } from 'graphql-yoga';
import { lookup as mimeLookup } from 'mime-types';
import { File } from '@whatwg-node/fetch';

const FILES_DIR = join(__dirname, 'files');

export const uploadFilesServer = createServer(
  createYoga({
    schema: createSchema({
      typeDefs: /* GraphQL */ `
        scalar File

        type FileEntry {
          name: String
          type: String
          text: String
          base64: String
        }

        type Query {
          readFile(name: String!): FileEntry!
        }

        type Mutation {
          uploadFile(file: File!): FileEntry!
        }
      `,
      resolvers: {
        Query: {
          async readFile(_root, { name }) {
            const buffer = await fsPromises.readFile(join(FILES_DIR, name));
            const type = mimeLookup(name) || 'application/octet-stream';
            return new File([buffer], name, { type });
          },
        },
        FileEntry: {
          // We don't need to implement resolvers for `name`, `type` and `text` since they are available on the root `File` object
          async base64(file: File) {
            const buffer = Buffer.from(await file.arrayBuffer());
            return buffer.toString('base64');
          },
        },
        Mutation: {
          uploadFile(_root, { file }: { file: File }) {
            const stream = createWriteStream(join(FILES_DIR, file.name));
            const nodeReadable = Readable.from(file.stream());
            nodeReadable.pipe(stream);
            return file;
          },
        },
      },
    }) as GraphQLSchema,
  }),
);
