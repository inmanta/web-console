import React from "react";
import { createMemoryRouter, RouterProvider, useBlocker } from "react-router-dom";

interface Props {
  basename?: string;
  children: React.ReactNode;
  initialEntries?: string[];
}

/**
 * TestMemoryRouter is a custom router implementation for tests that supports the useBlocker hook.
 * It wraps the createMemoryRouter from react-router-dom and provides a stable implementation
 * of the useBlocker functionality for testing purposes.
 */
export function TestMemoryRouter({ basename, children, initialEntries = ["/?env=aaa"] }: Props) {
  const router = createMemoryRouter(
    [
      {
        path: "/*",
        element: children,
      },
    ],
    {
      basename,
      initialEntries,
    }
  );

  return <RouterProvider router={router} />;
}

/**
 * A wrapper around the useBlocker hook to provide a stable interface for tests.
 * This hook can be used in test components to block navigation when needed.
 */
export function useTestBlocker(shouldBlock: boolean) {
  return useBlocker(shouldBlock);
}
