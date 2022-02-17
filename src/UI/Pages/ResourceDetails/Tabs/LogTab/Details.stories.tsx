import React from "react";
import { LogLevelString, ResourceLog } from "@/Core";
import { Details } from "./Details";

export default {
  title: "ResourceLog",
  component: Details,
};

const log: ResourceLog = {
  level: LogLevelString.ERROR,
  msg: "Failed to load handler code or install handler code dependencies. Check the agent log for details.",
  args: [],
  kwargs: {
    exc_info: "true",
    traceback: "error with tabs \t here and\n new\nlines",
  },
  timestamp: "2021-09-29T09:09:52.915172",
  action_id: "6eaedb6e-1a5a-4716-824e-ce3195ddaf81",
  action: "getfact",
};

export const Default = () => <Details log={log} />;
