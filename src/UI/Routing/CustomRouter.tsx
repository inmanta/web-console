import React from "react";
import { HistoryRouterProps, Router } from "react-router-dom";
/**
 * CustomRouter is base for implemntation usePrompt hook which allows to halt and resume navigation on demand.
 *
 * As for version 6.4 of react-router that package doesn't share logic mentioned above which we wanted to use in Form compoents and
 * their (stable) implementations of routers doesn't accept pre-initiated history object as parameter, which is essential to make this possible
 */
function CustomRouter({ basename, children, history }: HistoryRouterProps) {
  const [state, setState] = React.useState({
    action: history.action,
    location: history.location,
  });

  React.useLayoutEffect(() => history.listen(setState), [history]);

  return (
    <Router
      basename={basename}
      location={state.location}
      navigationType={state.action}
      navigator={history}
    >
      {children}
    </Router>
  );
}
export default CustomRouter;
