import type { ReactNode } from 'react';

function Keyword({ children }: { children: string }) {
  return <span className="text-sky-700 dark:text-sky-400">{children}</span>;
}

function TypeName({ children }: { children: string }) {
  return <span className="text-emerald-700 dark:text-emerald-400">{children}</span>;
}

function Str({ children }: { children: string }) {
  return <span className="text-rose-700 dark:text-rose-400">{children}</span>;
}

function Snippet({ children }: { children: ReactNode }) {
  return (
    <pre className="mt-2 overflow-x-auto font-mono text-[11px] leading-5 text-neutral-800 dark:text-neutral-200 sm:text-xs">
      {children}
    </pre>
  );
}

function Step({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-baseline gap-2 text-[11px] font-medium text-neutral-600 dark:text-neutral-400 sm:text-xs">
      <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-bold text-white dark:bg-neutral-100 dark:text-neutral-900">
        {n}
      </span>
      <span>{label}</span>
    </div>
  );
}

function Card({
  title,
  accent,
  badge,
  children,
}: {
  title: string;
  accent: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={`rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950 ${accent}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {badge ? (
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            {badge}
          </span>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function MergingFlow() {
  return (
    <figure className="not-prose my-8">
      <div className="grid gap-3">
        <Card title="Client" accent="border-l-4 border-l-sky-500">
          <Step n={1} label="requested query" />
          <Snippet>
            <Keyword>userById</Keyword>
            (id: <Str>"1"</Str>) {'{'}
            {'\n'}
            {'  '}email{'\n'}
            {'  '}posts {'{'} id {'}'}
            {'\n'}
            {'}'}
          </Snippet>
          <div className="mt-3 border-t border-neutral-200 pt-3 dark:border-neutral-800">
            <Step n={8} label="respond with requested fields" />
            <Snippet>
              {'{'}
              {'\n'}
              {'  '}
              <Str>"email"</Str>: <Str>"me@app.co"</Str>,{'\n'}
              {'  '}
              <Str>"posts"</Str>: [{'{'} <Str>"id"</Str>: <Str>"1"</Str> {'}'}]{'\n'}
              {'}'}
            </Snippet>
          </div>
        </Card>

        <Card title="Gateway schema" accent="border-l-4 border-l-neutral-400">
          <Snippet>
            <Keyword>type</Keyword> <TypeName>User</TypeName> {'{'}
            {'\n'}
            {'  '}id: <TypeName>ID!</TypeName>
            {'\n'}
            {'  '}email: <TypeName>String!</TypeName>
            {'\n'}
            {'  '}posts: [<TypeName>Post</TypeName>]!{'\n'}
            {'}'}
            {'\n'}
            <Keyword>type</Keyword> <TypeName>Query</TypeName> {'{'}
            {'\n'}
            {'  '}userById(id: <TypeName>ID!</TypeName>): <TypeName>User</TypeName>
            {'\n'}
            {'  '}postUserById(id: <TypeName>ID!</TypeName>): <TypeName>User</TypeName>
            {'\n'}
            {'}'}
          </Snippet>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
              <Step n={4} label="merge config builds merger query(s)" />
              <Snippet>
                <Keyword>fieldName</Keyword>: <Str>"postUserById"</Str>,{'\n'}
                <Keyword>args</Keyword>: origObj =&gt; ({'{'} id: origObj.id {'}'})
              </Snippet>
            </div>
            <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
              <Step n={7} label="merge all objects for type" />
              <Snippet>
                {'{'}...origObj, ...mergerObj{'}'}
              </Snippet>
            </div>
          </div>
        </Card>

        <div className="grid gap-3 md:grid-cols-2">
          <Card
            title="users subschema"
            badge="Resolve original object"
            accent="border-l-4 border-l-[#6eb8c4]"
          >
            <Snippet>
              <Keyword>type</Keyword> <TypeName>User</TypeName> {'{'}
              {'\n'}
              {'  '}id: <TypeName>ID!</TypeName>
              {'\n'}
              {'  '}email: <TypeName>String!</TypeName>
              {'\n'}
              {'}'}
              {'\n'}
              <Keyword>type</Keyword> <TypeName>Query</TypeName> {'{'}
              {'\n'}
              {'  '}userById(id: <TypeName>ID!</TypeName>): <TypeName>User</TypeName>
              {'\n'}
              {'}'}
            </Snippet>
            <div className="mt-3 border-t border-neutral-200 pt-3 dark:border-neutral-800">
              <Step n={2} label="filtered request + selectionSet(s)" />
              <Snippet>
                <Keyword>userById</Keyword>
                (id: <Str>"1"</Str>) {'{'}
                {'\n'}
                {'  '}email{'\n'}
                {'  '}id{'\n'}
                {'}'}
              </Snippet>
              <div className="mt-3">
                <Step n={3} label="original object response" />
                <Snippet>
                  {'{'}
                  {'\n'}
                  {'  '}
                  <Str>"email"</Str>: <Str>"me@app.co"</Str>,{'\n'}
                  {'  '}
                  <Str>"id"</Str>: <Str>"1"</Str>
                  {'\n'}
                  {'}'}
                </Snippet>
              </div>
            </div>
          </Card>

          <Card
            title="posts subschema"
            badge="Resolve merger object(s)"
            accent="border-l-4 border-l-[#af8aa1]"
          >
            <Snippet>
              <Keyword>type</Keyword> <TypeName>User</TypeName> {'{'}
              {'\n'}
              {'  '}id: <TypeName>ID!</TypeName>
              {'\n'}
              {'  '}posts: [<TypeName>Post</TypeName>]!{'\n'}
              {'}'}
              {'\n'}
              <Keyword>type</Keyword> <TypeName>Query</TypeName> {'{'}
              {'\n'}
              {'  '}postUserById(id: <TypeName>ID!</TypeName>): <TypeName>User</TypeName>
              {'\n'}
              {'}'}
            </Snippet>
            <div className="mt-3 border-t border-neutral-200 pt-3 dark:border-neutral-800">
              <Step n={5} label="filtered request + selectionSet(s)" />
              <Snippet>
                <Keyword>postUserById</Keyword>
                (id: <Str>"1"</Str>) {'{'}
                {'\n'}
                {'  '}posts {'{'} id {'}'}
                {'\n'}
                {'  '}id{'\n'}
                {'}'}
              </Snippet>
              <div className="mt-3">
                <Step n={6} label="merger object response" />
                <Snippet>
                  {'{'}
                  {'\n'}
                  {'  '}
                  <Str>"posts"</Str>: [{'{'} <Str>"id"</Str>: <Str>"1"</Str> {'}'}],{'\n'}
                  {'  '}
                  <Str>"id"</Str>: <Str>"1"</Str>
                  {'\n'}
                  {'}'}
                </Snippet>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-sm text-neutral-500 dark:text-neutral-400">
        A client query is split across subschemas, then merged in the gateway.
      </figcaption>
    </figure>
  );
}
