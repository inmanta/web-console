import React, { useCallback, useEffect, useMemo } from "react";
import { useLocation } from "react-router";
import { Fetcher } from "@graphiql/toolkit";
import { GraphiQL } from "graphiql";
import graphiqlCSS from "graphiql/style.css?inline";
import styled, { createGlobalStyle } from "styled-components";
import { words } from "@inmanta/web-console-core";
import {
  useGetGraphQLSchema,
  usePostGraphQL,
} from "@inmanta/web-console-core/Queries/Slices/GraphiQL";
import { useTheme } from "@inmanta/web-console-ui/Components/DarkmodeOption";
import { PageContainer } from "@inmanta/web-console-ui/Components/PageContainer";
import { registerGraphQLWorker } from "./graphqlWorker";

registerGraphQLWorker();

// ?inline tells Vite to give us the CSS as a plain string instead of injecting
// it as a global stylesheet. We inject it ourselves (wrapped in @layer so its
// bundled copy of Monaco CSS has lower cascade priority than the app's own
// Monaco styles) and remove it on unmount so it never bleeds into other routes.

const DEFAULT_QUERY = `{
  environments {
    edges {
      node {
        id
      }
    }
  }
}`;

/**
 * GraphiQL page that points queries to /api/v2/graphql.
 *
 * Schema is fetched via GET /api/v2/graphql/schema and passed directly to
 * GraphiQL, bypassing its built-in introspection mechanism. This avoids a
 * race condition where GraphiQL fires an introspection POST before the schema
 * is ready and shows "error fetching schema".
 *
 * Theme is kept in sync with the app's dark/light mode by observing class
 * changes on <html> (tracked by useTheme) and forwarding the value to
 * GraphiQL's forcedTheme prop.
 */
export const Page: React.FC = () => {
  const { search } = useLocation();

  const env = useMemo(() => {
    const envParam = new URLSearchParams(search).get("env");

    return envParam ?? undefined;
  }, [search]);

  const { theme } = useTheme();

  // Inject graphiql's CSS (including its bundled Monaco copy) inside a
  // @layer so it has lower cascade priority than the app's own Monaco styles.
  // Removing it on unmount prevents it from bleeding into other routes.
  useEffect(() => {
    const style = document.createElement("style");
    style.setAttribute("data-graphiql-styles", "");
    style.textContent = `@layer graphiql-vendor {\n${graphiqlCSS}\n}`;
    document.head.appendChild(style);

    return () => style.remove();
  }, []);

  const { data: schema, isPending: isSchemaPending } = useGetGraphQLSchema(env);
  const { mutateAsync } = usePostGraphQL(env);

  // Wrap mutateAsync in useCallback for a stable reference — GraphiQL re-triggers
  // introspection whenever the fetcher identity changes.
  const fetcher = useCallback<Fetcher>(
    (graphQLParams) => mutateAsync(graphQLParams),
    [mutateAsync]
  );

  return (
    <PageContainer pageTitle={words("graphiql.title")} padding={{ default: "noPadding" }}>
      <GraphiQLGlobalStyle />
      <EditorContainer>
        <GraphiQL
          fetcher={fetcher}
          schema={isSchemaPending ? null : (schema ?? null)}
          forcedTheme={theme}
          defaultEditorToolsVisibility="headers"
          isHeadersEditorEnabled
          defaultQuery={DEFAULT_QUERY}
        />
      </EditorContainer>
    </PageContainer>
  );
};

/**
 * GraphiQL renders its settings and short-keys dialogs into a portal at
 * document.body via @radix-ui/react-dialog. The library ships with
 * z-index: 10 for both the overlay and the dialog, which is too low for a
 * PatternFly app (PatternFly uses z-index values in the hundreds). Without
 * this override the dialogs appear behind other page elements and are
 * effectively unusable.
 */
const GraphiQLGlobalStyle = createGlobalStyle`
  .graphiql-dialog-overlay {
    z-index: 9999;
  }
  .graphiql-dialog {
    z-index: 10000;
  }
`;

const EditorContainer = styled.div`
  /* Offset accounts for the app top navigation bar, page title bar, and surrounding padding. */
  height: calc(100vh - 240px);
`;
