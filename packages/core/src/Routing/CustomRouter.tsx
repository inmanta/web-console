import React from "react";
import { createBrowserRouter, RouteObject, RouterProvider } from "react-router";

/**
 * CustomRouter is a wrapper component that provides the necessary router context for the usePrompt hook to function.
 * The usePrompt hook (from react-router) requires a router context to work properly, which this component provides.
 *
 * This component is essential for implementing navigation blocking functionality, allowing you to:
 * - Prompt users before they leave a page
 * - Prevent accidental navigation when there are unsaved changes
 * - Handle browser refresh/close events
 *
 * The routes are registered on the data router itself, with `layout` as their pathless parent.
 * Don't nest descendant `<Routes>` under a `/*` route instead: React Router's splat doesn't match
 * pathnames containing a decoded newline, so those urls would never reach the descendant routes.
 *
 * @component
 * @props {Props} props - The component props
 *  @prop {string} [props.basename] - The base URL for all locations. If your app is served from a sub-directory on your server, you'll want to set this to the sub-directory.
 *  @prop {React.ReactNode} props.layout - The element wrapping every route; it renders the matched route in an `Outlet`.
 *  @prop {RouteObject[]} props.routes - The routes of the app
 * @returns {JSX.Element} A RouterProvider component configured with the specified basename and routes
 *
 * @example
 * ```tsx
 * <CustomRouter basename="/app" layout={<App />} routes={appRoutes} />
 * ```
 */
function CustomRouter({
  basename,
  layout,
  routes,
}: {
  basename?: string;
  layout: React.ReactNode;
  routes: RouteObject[];
}) {
  const router = createBrowserRouter([{ element: layout, children: routes }], {
    basename,
  });

  return <RouterProvider router={router} />;
}

export default CustomRouter;
