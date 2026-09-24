/**
 * Writes the GraphQL schema of a running orchestrator to schema.graphql, which GraphQL Code Generator types
 * the queries against. The orchestrator serves its schema as introspection JSON, codegen reads SDL.
 */
import { writeFileSync } from "node:fs";
import { buildClientSchema, printSchema } from "graphql";

const target = process.env.VITE_API_BASEURL || process.env.PROXY_TARGET || "http://localhost:8888";

const response = await fetch(`${target}/api/v2/graphql/schema`);
const { data } = await response.json();

writeFileSync("schema.graphql", printSchema(buildClientSchema(data)) + "\n");
console.log(`Wrote schema.graphql from ${target}`);
