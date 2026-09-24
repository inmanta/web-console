import type { CodegenConfig } from "@graphql-codegen/cli";

/**
 * GraphQL Code Generator config. It types every `graphql()` document in src against schema.graphql and the
 * client schema, and writes the typed documents to src/Data/Apollo/gql. Refresh the schema with `yarn codegen:schema`.
 */
const config: CodegenConfig = {
  // The orchestrator's schema, plus the fields and mutations that Apollo resolves in the browser.
  schema: ["./schema.graphql", "./src/Data/Apollo/clientSchema.graphql"],
  documents: ["src/**/*.{ts,tsx}", "!src/Data/Apollo/gql/**"],
  pluckConfig: {
    modules: [{ name: "@/Data/Apollo/gql", identifier: "graphql" }],
    globalGqlIdentifierName: [],
  },
  generates: {
    "src/Data/Apollo/gql/": {
      preset: "client",
      presetConfig: { fragmentMasking: false },
      config: {
        scalars: { JSON: "unknown", UUID: "string", DateTime: "string" },
        // Type fragment spreads as masked, matching Apollo's data masking at runtime.
        customDirectives: { apolloUnmask: true },
        inlineFragmentTypes: "mask",
        // Apollo adds __typename to every selection, so the generated types include it too.
        nonOptionalTypename: true,
        // Enums as const objects, so their values can also be used at runtime (filter options, lookups).
        enumType: "const",
        useTypeImports: true,
      },
    },
  },
};

export default config;
