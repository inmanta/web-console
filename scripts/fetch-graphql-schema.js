/**
 * Fetches the GraphQL schema from a running orchestrator and writes it to the schema file that
 * codegen generates the query types from. The orchestrator wraps the GraphQL response in an extra
 * `data` envelope, which codegen can't read itself, so this script unwraps it.
 *
 * Usage: `yarn codegen:schema [orchestrator url]`, the url defaults to http://localhost:8888.
 *
 * TODO: https://github.com/inmanta/inmanta-core/issues/11187 replace this script with codegen's
 * schema-ast plugin once core returns a standard GraphQL response.
 */
import { writeFileSync } from "fs";
import { buildClientSchema, getIntrospectionQuery, printSchema } from "graphql";

const orchestratorUrl = process.argv[2] ?? "http://localhost:8888";
const schemaPath = "packages/core/src/GraphQL/schema.graphql";

const response = await fetch(`${orchestratorUrl}/api/v2/graphql`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query: getIntrospectionQuery() }),
});

if (!response.ok) {
  console.error(
    `ERROR: ${orchestratorUrl} answered the introspection query with ${response.status}.`
  );
  process.exit(1);
}

const body = await response.json();

writeFileSync(schemaPath, `${printSchema(buildClientSchema(body.data.data))}\n`);
console.log(`Wrote the GraphQL schema of ${orchestratorUrl} to ${schemaPath}.`);
