import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import { Fetcher } from "@graphiql/toolkit";
import { useQueryClient } from "@tanstack/react-query";
import { GraphiQL } from "graphiql";
import styled, { createGlobalStyle } from "styled-components";
import { useGetGraphQLSchema, usePostGraphQL, graphQLSchemaKey } from "@/Data/Queries";
import { PageContainer } from "@/UI/Components";
import { getThemePreference } from "@/UI/Components/DarkmodeOption";
import { words } from "@/UI/words";

// ?inline tells Vite to give us the CSS as a plain string instead of injecting
// it as a global stylesheet. We inject it ourselves (wrapped in @layer so its
// bundled copy of Monaco CSS has lower cascade priority than the app's own
// Monaco styles) and remove it on unmount so it never bleeds into other routes.
import graphiqlCSS from "graphiql/style.css?inline";

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
 * changes on <html> (set by setThemePreference) and forwarding the value to
 * GraphiQL's forcedTheme prop.
 *
 * The sidebar's "Re-fetch schema" button is intercepted via event delegation
 * because GraphiQL's internal introspect() is a no-op when a schema prop is
 * provided. Clicking that button instead invalidates the React Query cache,
 * triggering a fresh GET to /api/v2/graphql/schema.
 */
export const Page: React.FC = () => {
  const { search } = useLocation();

  const env = useMemo(() => {
    const envParam = new URLSearchParams(search).get("env");
    return envParam ?? undefined;
  }, [search]);

  // Mirror the app-wide theme so GraphiQL matches the current dark/light mode.
  // MutationObserver watches for class changes on <html> made by setThemePreference.
  const [theme, setTheme] = useState<"dark" | "light">(
    () => (getThemePreference() ?? "light") as "dark" | "light"
  );

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

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme((getThemePreference() ?? "light") as "dark" | "light");
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const queryClient = useQueryClient();
  const { data: schema, isPending: isSchemaPending } = useGetGraphQLSchema(env);
  const { mutateAsync } = usePostGraphQL(env);

  // Wrap mutateAsync in useCallback for a stable reference — GraphiQL re-triggers
  // introspection whenever the fetcher identity changes.
  const fetcher = useCallback<Fetcher>(
    (graphQLParams) => mutateAsync(graphQLParams),
    [mutateAsync]
  );

  // GraphiQL's internal introspect() is a no-op when a schema prop is provided
  // (shouldIntrospect is set to false). Intercept the sidebar button click via
  // event delegation and invalidate the React Query cache instead.
  // NOTE: The aria-label selector below is an internal implementation detail of
  // graphiql@5.x. If a future upgrade silently breaks the Re-fetch button,
  // verify that GraphiQL's ToolbarButton aria-label hasn't changed.
  const handleRefetchSchema = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[aria-label^="Re-fetch GraphQL schema"]')) {
        queryClient.invalidateQueries({
          queryKey: graphQLSchemaKey.single("schema", [env ?? ""]),
        });
      }
    },
    [queryClient, env]
  );

  return (
    <PageContainer pageTitle={words("graphiql.title")} padding={{ default: "noPadding" }}>
      <GraphiQLGlobalStyle />
      <EditorContainer onClick={handleRefetchSchema}>
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
