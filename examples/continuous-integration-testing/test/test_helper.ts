import { stitchingDirectives } from "@graphql-tools/stitching-directives";
import { IResolvers, printSchemaWithDirectives } from "@graphql-tools/utils";
import { createSchema } from "graphql-yoga";
import { buildGatewaySchema, buildSubschemaConfigs } from "../src/schema_builder";
import { addMocksToSchema, IMocks } from "@graphql-tools/mock";
import { graphql } from "graphql";
import * as productsFixtures from "./mock_services/products";
import * as reviewsFixtures from "./mock_services/reviews";
import * as usersFixtures from "./mock_services/users";

// Setup a mapping of test fixtures by service name

interface Fixture {
    resolvers?: IResolvers;
    mocks?: IMocks;
}

const fixturesByName: Record<string, Fixture> = {
    products: productsFixtures,
    reviews: reviewsFixtures,
    users: usersFixtures,
};

// Get the actual subschemas built for the production app:
const subschemaConfigs = buildSubschemaConfigs();

// Reconfigure the subschema configurations for testing...
// makes all subschemas locally-executable,
// and sets them up with mocked fixture data to test with.
Object.entries(subschemaConfigs).forEach(([name, subschemaConfig]) => {
    const fixtures = fixturesByName[name] || {};

    const { stitchingDirectivesValidator } = stitchingDirectives();

    // build all of the base schemas into locally-executable test schemas
    // apply mock service resolvers to give them some simple record fixtures
    const schema = stitchingDirectivesValidator(createSchema({
        typeDefs: printSchemaWithDirectives(subschemaConfig.schema),
        resolvers: fixtures.resolvers,
    }));

    // apply mocks to fill in missing values
    // anything without a resolver or fixture data
    // gets filled in with a predictable service-specific scalar
    subschemaConfig.schema = addMocksToSchema({
        preserveResolvers: true,
        schema,
        mocks: {
            String: () => `${name}-value`,
            ...(fixtures.mocks || {}),
        }
    });

    // remove all executors (run everything as a locally-executable schema)
    delete subschemaConfig.executor;
});

// Run the gateway builder using the mocked subservices
// this gives the complete stitched gateway talking to mocked services.
const mockedGateway = buildGatewaySchema(subschemaConfigs);

export function queryMockedGateway(query: string, variables: any = {}) {
    return graphql({
        schema: mockedGateway,
        source: query,
        variableValues: variables,
    });
}