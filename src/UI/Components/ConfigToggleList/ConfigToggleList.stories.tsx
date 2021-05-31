import React from "react";
import { ConfigToggleList } from "./ConfigToggleList";

export default {
  title: "ConfigToggleList",
  component: ConfigToggleList,
};

const settings = [
  { name: "auto_update_designed", value: false, defaultValue: true },
  { name: "auto_designed", value: false, defaultValue: false },
  { name: "auto_creating", value: true, defaultValue: false },
  { name: "auto_update_inprogress", value: true, defaultValue: true },
];

export const Default: React.FC = () => (
  <ConfigToggleList
    settings={settings}
    onChange={(name, value) => {
      console.log({ name, value });
    }}
  />
);
