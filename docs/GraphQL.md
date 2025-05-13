# GraphQL

## Implementation

We currently goes by the bare minimum approach with `React Query` as our state manager, `graphql-request` - Most simple & lightweight GraphQL client, and `graphQL` as a dependency for `graphql-request`

At the time of writing this docs, our endpoint does not support variables mentioned in POST request and body section in https://graphql.org/learn/serving-over-http/, so we can't fully take advantage of universal queries but can be done in the future

## Notes

Query Response differs in the structure compared to our REST queries, outside normal errors in that changes status of the query's isError to `true`,
notifications can return error in a successful request as now response looks like this:

```
interface QLResponse<ResponseType> {
  data: ResponseType;
  errors: string[] | null;
  extensions: Record<string, unknown>;
}
```

More about the structure of the response is (here)[https://graphql.org/learn/response/#extensions]
