import { createServer } from 'http';
import { GraphQLSchema } from 'graphql';
import { createYoga } from 'graphql-yoga';
import { list, makeSchema, nonNull, objectType, queryType, scalarType } from 'nexus';
import { stitchingDirectives } from '@graphql-tools/stitching-directives';
import { printSchemaWithDirectives } from '@graphql-tools/utils';

const { allStitchingDirectives, stitchingDirectivesValidator } = stitchingDirectives();

const inventories = [
  { upc: '1', unitsInStock: 3 },
  { upc: '2', unitsInStock: 0 },
  { upc: '3', unitsInStock: 5 },
];

const _Key = scalarType({
  name: '_Key',
});

const Product = objectType({
  name: 'Product',
  definition(t) {
    t.nonNull.id('upc');
    t.boolean('inStock', {
      resolve(product) {
        return product.unitsInStock > 0;
      },
    });
    t.int('shippingEstimate', {
      resolve(product) {
        // free for expensive items, otherwise estimate based on weight
        return product.price > 1000 ? 0 : Math.round(product.weight * 0.5);
      },
      extensions: {
        directives: {
          computed: {
            selectionSet: '{ price weight }',
          },
        },
      },
    });
  },
  extensions: {
    directives: {
      key: {
        selectionSet: '{ upc }',
      },
    },
  },
});

const Query = queryType({
  definition(t) {
    t.field('mostStockedProduct', {
      type: Product,
      resolve() {
        return inventories.reduce(
          (acc, i) => (acc.unitsInStock >= i.unitsInStock ? acc : i),
          inventories[0],
        );
      },
    });
    t.field('_products', {
      type: nonNull(list(Product)),
      args: {
        keys: nonNull(list(nonNull(_Key))),
      },
      resolve(_root, { keys }) {
        return keys.map(key => {
          const inventory = inventories.find(i => i.upc === key.upc);
          return inventory
            ? { ...key, ...inventory }
            : new GraphQLError('Record not found', {
                extensions: {
                  code: 'NOT_FOUND',
                },
              });
        });
      },
      extensions: {
        directives: {
          merge: {},
        },
      },
    });
    t.nonNull.string('_sdl', {
      resolve(_root, _args, _context, info) {
        return printSchemaWithDirectives(info.schema);
      },
    });
  },
});

const inventorySchema = makeSchema({ types: [Query] });

// Directive usage without definitions will throw an error on the gateway when it attempts to build
// a non-executable schema from the subschema's SDL. The below code will add the definitions:
const extendedSchema = new GraphQLSchema({
  ...inventorySchema.toConfig(),
  directives: [...inventorySchema.getDirectives(), ...allStitchingDirectives],
});

// Alternatively, the schema could be built on the gateway  using options { assumeValidSDL: true },
// but this would skip a layer of validation.

export const inventoryServer = createServer(
  createYoga({
    schema: stitchingDirectivesValidator(extendedSchema),
  }),
);
