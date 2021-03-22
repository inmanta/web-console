import React from "react";
import { ConfigView } from "./ConfigView";

export default {
  title: "ConfigView",
  component: ConfigView,
};

const settings = [
  { name: "auto_designed", value: false, defaultValue: false },
  { name: "auto_creating", value: true, defaultValue: false },
  { name: "auto_update_designed", value: false, defaultValue: true },
  { name: "auto_update_inprogress", value: true, defaultValue: true },
];

export const Default: React.FC = () => <ConfigView settings={settings} />;
