import { createSchema, createYoga } from 'graphql-yoga';
import { createServer } from 'http';
import sharp from 'sharp';

export const resizeImagesServer = createServer(
  createYoga({
    schema: createSchema({
      typeDefs: /* GraphQL */ `
        scalar File
        type Query {
          resizeImage(file: File!, width: Int!, height: Int!): String
        }
      `,
      resolvers: {
        Query: {
          async resizeImage(_root, { file, width, height }: { file: File; width: number; height: number }) {
            const inputBuffer = Buffer.from(await file.arrayBuffer());
            const buffer = await sharp(inputBuffer).resize(width, height).toBuffer();
            const base64 = buffer.toString('base64');
            return base64;
          },
        },
      },
    }),
  })
);
