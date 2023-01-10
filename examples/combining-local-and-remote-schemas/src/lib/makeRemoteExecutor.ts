import { AsyncExecutor } from '@graphql-tools/utils';
import { fetch } from '@whatwg-node/fetch';
import { print } from 'graphql';

// Builds a remote schema executor function,
// customize any way that you need (auth, headers, etc).
// Expects to receive an object with "document" and "variable" params,
// and asynchronously returns a JSON response from the remote.
export function makeRemoteExecutor(url: string): AsyncExecutor {
    return async ({ document, variables, context }) => {
        const query = print(document);
        const fetchResult = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': context?.['authHeader'],
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query, variables }),
        });
        return fetchResult.json();
    };
}