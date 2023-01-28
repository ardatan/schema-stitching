// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { ExecutionResult, GraphQLError } from 'graphql';
import { isAsyncIterable } from 'graphql-yoga';
import { buildHTTPExecutor } from '@graphql-tools/executor-http';
import { ExecutionRequest } from '@graphql-tools/utils';
import { fetch } from '@whatwg-node/fetch';

async function jsonOrError(res: Response, status: number) {
  if (res.status !== status) {
    const json = await res.json();
    throw new GraphQLError(json.message || res.statusText, {
      extensions: {
        http: {
          status: res.status,
        },
      },
    });
  }
  return res.json();
}

interface TreeFile {
  path: string;
  content: string;
  mode: string;
  type: string;
}

type GraphQLHandler = <TData = any>(request: ExecutionRequest) => Promise<ExecutionResult<TData>>;

export interface RepoConfig {
  owner: string;
  repo: string;
  mainBranch: string;
  token: string;
  registryPath: string;
}

// Simple client for talking to the GitHub API v3 (REST)
// (the v4 GraphQL API does not provide the gitdata interface)
export class GitHubClient {
  public owner: string;
  public repo: string;
  public mainBranch: string;
  private headers: Record<string, string>;
  public graphql: GraphQLHandler;
  constructor({ owner, repo, token, mainBranch }: RepoConfig) {
    this.owner = owner;
    this.repo = repo;
    this.mainBranch = mainBranch;
    this.headers = {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const executor = buildHTTPExecutor({
      endpoint: 'https://api.github.com/graphql',
      headers: this.headers,
      timeout: 3500,
    });
    this.graphql = async function graphqlHandler<TData = any>(
      request: ExecutionRequest,
    ): Promise<ExecutionResult<TData>> {
      const result = await executor(request);
      if (isAsyncIterable(result)) {
        throw new Error('Expected executor to return a Promise, but got an AsyncIterable');
      }
      return result;
    };
  }

  async getBranch(branchName: string): Promise<{ name: string; object: { sha: string } }> {
    const res = await fetch(
      `https://api.github.com/repos/${this.owner}/${this.repo}/git/ref/heads/${branchName}`,
      {
        method: 'GET',
        headers: this.headers,
      },
    );

    return jsonOrError(res, 200);
  }

  async createBranch(branchName: string) {
    const main = await this.getBranch(this.mainBranch);
    const res = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/git/refs`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        ref: `refs/heads/${branchName}`,
        sha: main.object.sha,
      }),
    });

    return jsonOrError(res, 201);
  }

  async updateBranchHead(branchName: string, sha: string, force = false) {
    const res = await fetch(
      `https://api.github.com/repos/${this.owner}/${this.repo}/git/refs/heads/${branchName}`,
      {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify({
          sha,
          force,
        }),
      },
    );

    return jsonOrError(res, 200);
  }

  async createTree(headRef: string, files: TreeFile[]) {
    const res = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/git/trees`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        base_tree: headRef,
        tree: files,
      }),
    });

    return jsonOrError(res, 201);
  }

  async createCommit(headRef: string, tree: TreeFile[], message: string) {
    const res = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/git/commits`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        parents: [headRef],
        tree,
        message,
      }),
    });

    return jsonOrError(res, 201);
  }

  async getPullRequest(branchName: string) {
    const res = await fetch(
      `https://api.github.com/repos/${this.owner}/${this.repo}/pulls?head=${this.owner}:${branchName}&state=open`,
      {
        method: 'GET',
        headers: this.headers,
      },
    );

    const json = await jsonOrError(res, 200);
    return json[0];
  }

  async createPullRequest(branchName: string) {
    const res = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/pulls`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        title: `Gateway schema release: ${branchName}`,
        body: 'Release candidate for remote schema revisions',
        head: branchName,
        base: this.mainBranch,
      }),
    });

    return jsonOrError(res, 201);
  }

  async mergePullRequest(branchName: string, message: string) {
    const pr = await this.getPullRequest(branchName);
    if (!pr) throw new Error('Not found');

    const res = await fetch(
      `https://api.github.com/repos/${this.owner}/${this.repo}/pulls/${pr.number}/merge`,
      {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify({
          commit_title: `[gateway schema release]: ${branchName}`,
          commit_message: message || 'merged by schema registry',
          merge_method: 'squash',
        }),
      },
    );

    return jsonOrError(res, 200);
  }
}
