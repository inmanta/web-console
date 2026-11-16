import type { CodegenConfig } from "@graphql-codegen/cli";

/**
 * Generates the types of every GraphQL query in core from the orchestrator's schema (`yarn codegen`).
 * The schema is a committed file that `yarn codegen:schema` pulls from an orchestrator, so generating needs no running server.
 * For autocomplete and validation inside `graphql()` queries, install the "GraphQL: Language Feature Support"
 * extension in VS Code or the GraphQL plugin in JetBrains editors; both read this file.
 */
const codegen: CodegenConfig = {
  ignoreNoDocuments: true,
  generates: {
    "packages/core/src/GraphQL/generated/": {
      preset: "client",
      // No query uses fragments, so the fragment masking helpers would be unused code.
      presetConfig: { fragmentMasking: false },
      config: {
        documentMode: "string",
        useTypeImports: true,
        // Without these, the custom scalars would be typed as any.
        scalars: { UUID: "string", DateTime: "string", JSON: "unknown" },
      },
    },
  },
};

export default {
  schema: "packages/core/src/GraphQL/schema.graphql",
  documents: ["packages/core/src/**/*.{ts,tsx}", "!packages/core/src/GraphQL/generated/**"],
  extensions: { codegen },
};
