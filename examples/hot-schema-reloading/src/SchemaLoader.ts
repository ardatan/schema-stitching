import { GraphQLSchema, parse } from 'graphql';
import { buildHTTPExecutor } from '@graphql-tools/executor-http';
import { isAsyncIterable } from '@graphql-tools/utils';

interface LoadedEndpoint {
  url: string;
  sdl: string;
}

export class SchemaLoader {
  public schema: GraphQLSchema | null = null;
  public loadedEndpoints: LoadedEndpoint[] = [];
  private intervalId: NodeJS.Timeout | null = null;

  constructor(
    private buildSchema: (endpoints: LoadedEndpoint[]) => GraphQLSchema,
    public endpoints: string[],
  ) {}

  async reload() {
    const loadedEndpoints: LoadedEndpoint[] = [];
    await Promise.all(
      this.endpoints.map(async url => {
        try {
          const fetcher = buildHTTPExecutor({
            endpoint: url,
            timeout: 300,
          });
          const result = await fetcher({
            document: parse(/* GraphQL */ `
              {
                _sdl
              }
            `),
          });
          if (isAsyncIterable(result)) {
            throw new Error('Expected executor to return a single result');
          }
          loadedEndpoints.push({
            url,
            sdl: result.data._sdl,
          });
        } catch (err) {
          // drop the schema, or return the last cached version, etc...
        }
      }),
    );

    this.loadedEndpoints = loadedEndpoints;
    this.schema = this.buildSchema(this.loadedEndpoints);
    console.log(
      `gateway reload ${new Date().toLocaleString()}, endpoints: ${this.loadedEndpoints.length}`,
    );
    return this.schema;
  }

  autoRefresh(interval = 3000) {
    this.stopAutoRefresh();
    this.intervalId = setTimeout(async () => {
      await this.reload();
      this.intervalId = null;
      this.autoRefresh(interval);
    }, interval);
  }

  stopAutoRefresh() {
    if (this.intervalId != null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
