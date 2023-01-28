import { GraphQLSchema } from 'graphql';
import { createSchema } from 'graphql-yoga';
import { SchemaRegistry } from '../schema_registry';

export function makeRegistrySchema(registry: SchemaRegistry): GraphQLSchema {
  return createSchema({
    typeDefs: /* GraphQL */ `
      type RemoteService {
        name: String!
        url: String!
      }

      type SchemaReleaseBranch {
        name: String!
        sha: String!
        url: String!
        pullRequestUrl: String
      }

      type SchemaRelease {
        name: String!
        sha: String!
      }

      type Query {
        remoteServices: [RemoteService]!
      }

      type Mutation {
        createSchemaReleaseBranch(name: String!, message: String): SchemaReleaseBranch!
        updateSchemaReleaseBranch(name: String!, message: String): SchemaReleaseBranch!
        createOrUpdateSchemaReleaseBranch(name: String!, message: String): SchemaReleaseBranch!
        mergeSchemaReleaseBranch(name: String!, message: String): SchemaRelease!
      }
    `,
    resolvers: {
      Query: {
        remoteServices: () => registry.services,
      },
      Mutation: {
        async createSchemaReleaseBranch(_root, { name, message }) {
          return registry.createReleaseBranch(name, message);
        },
        async updateSchemaReleaseBranch(_root, { name, message }) {
          return registry.updateReleaseBranch(name, message);
        },
        async createOrUpdateSchemaReleaseBranch(_root, { name, message }) {
          return registry.createOrUpdateReleaseBranch(name, message);
        },
        async mergeSchemaReleaseBranch(_root, { name, message }) {
          return registry.mergeReleaseBranch(name, message);
        },
      },
    },
  });
}
