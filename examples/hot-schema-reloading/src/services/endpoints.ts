import { createSchema } from 'graphql-yoga';
import { SchemaLoader } from '../SchemaLoader';

const typeDefs = /* GraphQL */ `
  type Endpoint {
    url: String!
    sdl: String
  }

  type Query {
    endpoints: [Endpoint!]!
  }

  type AddEndpointResult {
    endpoint: Endpoint
    success: Boolean!
  }

  type RemoveEndpointResult {
    success: Boolean!
  }

  type ReloadAllEndpointsResult {
    success: Boolean!
  }

  type Mutation {
    addEndpoint(url: String!): AddEndpointResult!
    removeEndpoint(url: String!): RemoveEndpointResult!
    reloadAllEndpoints: ReloadAllEndpointsResult!
  }
`;

export function makeEndpointsSchema(loader: SchemaLoader) {
  return {
      schema: createSchema({
          typeDefs,
          resolvers: {
              Query: {
                  endpoints: () => loader.loadedEndpoints,
              },
              Mutation: {
                  async addEndpoint(_root, { url }) {
                      let success = false;
                      if (!loader.endpoints.includes(url)) {
                          loader.endpoints.push(url);
                          await loader.reload();
                          success = true;
                      }
                      return {
                          endpoint: loader.loadedEndpoints.find(s => s.url === url),
                          success,
                      };
                  },
                  async removeEndpoint(_root, { url }) {
                      let success = false;
                      const index = loader.endpoints.indexOf(url);
                      if (index > -1) {
                          loader.endpoints.splice(index, 1);
                          await loader.reload();
                          success = true;
                      }
                      return { success };
                  },
                  async reloadAllEndpoints() {
                      await loader.reload();
                      return { success: true };
                  },
              },
          },
      })
  };
}
