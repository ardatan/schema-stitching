import { createServer } from 'http';
import { createSchema, createYoga } from 'graphql-yoga';

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
          async resizeImage(
            _root,
            { file, width, height }: { file: File; width: number; height: number },
          ) {
            let buffer: Buffer;
            try {
              const sharp = await import('sharp').then(m => m.default);
              const inputBuffer = Buffer.from(await file.arrayBuffer());
              buffer = await sharp(inputBuffer).resize(width, height).toBuffer();
            } catch (error) {
              console.error('Error processing image:', error);
              buffer = Buffer.from(await file.arrayBuffer());
            }
            const base64 = buffer.toString('base64');
            return base64;
          },
        },
      },
    }),
  }),
);
