import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

/**
 * CustomRouter is base for implementation usePrompt hook which allows to halt and resume navigation on demand.
 *
 * As for version 6.4 of react-router that package doesn't share logic mentioned above which we wanted to use in Form compoents and
 * their (stable) implementations of routers doesn't accept pre-initiated history object as parameter, which is essential to make this possible
 */
function CustomRouter({ basename, children }: { basename?: string; children: React.ReactNode }) {
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

export default CustomRouter;
