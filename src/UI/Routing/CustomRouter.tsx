import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router";

/**
 * CustomRouter is a wrapper component that provides the necessary router context for the usePrompt hook to function.
 * The usePrompt hook (from react-router) requires a router context to work properly, which this component provides.
 *
 * This component is essential for implementing navigation blocking functionality, allowing you to:
 * - Prompt users before they leave a page
 * - Prevent accidental navigation when there are unsaved changes
 * - Handle browser refresh/close events
 *
 * @component
 * @props {HistoryRouterProps} props - The component props
 *  @prop {string} [props.basename] - The base URL for all locations. If your app is served from a sub-directory on your server, you'll want to set this to the sub-directory.
 *  @prop {React.ReactNode} props.children - The child components to be rendered within the router
 * @returns {JSX.Element} A RouterProvider component configured with the specified basename and children
 *
 * @example
 * ```tsx
 * <CustomRouter basename="/app">
 *   <App />
 * </CustomRouter>
 * ```
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
