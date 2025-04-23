import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

interface Props {
  basename?: string;
  children: React.ReactNode;
}

export function DataRouter({ basename, children }: Props) {
  const router = createBrowserRouter(
    [
      {
        path: "/*",
        element: children,
      },
    ],
    {
      basename,
    }
  );

  return <RouterProvider router={router} />;
}
