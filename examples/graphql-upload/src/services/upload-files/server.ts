import { promises as fsPromises } from 'fs';
import { createServer } from 'http';
import { join } from 'path';
import { GraphQLSchema } from 'graphql';
import { createSchema, createYoga } from 'graphql-yoga';
import { lookup as mimeLookup } from 'mime-types';

const FILES_DIR = join(__dirname, 'files');

const yoga = createYoga({
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
          return new yoga.fetchAPI.File([buffer], name, { type });
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
        async uploadFile(_root, { file }: { file: File }) {
          const buffer = Buffer.from(await file.arrayBuffer());
          await fsPromises.writeFile(join(FILES_DIR, file.name), buffer);
          return new yoga.fetchAPI.File([buffer], file.name, { type: file.type });
        },
      },
    },
  }) as GraphQLSchema,
});

export const uploadFilesServer = createServer(yoga);
