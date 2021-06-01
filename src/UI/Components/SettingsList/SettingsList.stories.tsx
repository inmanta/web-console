import React from "react";
import { DefaultSwitch } from "@/UI/Components";
import { SettingsList } from "./SettingsList";

export default {
  title: "SettingsList",
  component: SettingsList,
};

const settings = [
  { name: "auto_update_designed", value: false, defaultValue: true },
  { name: "auto_designed", value: false, defaultValue: false },
  { name: "auto_creating", value: true, defaultValue: false },
  { name: "auto_update_inprogress", value: true, defaultValue: true },
];

export const Default: React.FC = () => (
  <SettingsList
    settings={settings}
    onChange={(name, value) => {
      console.log({ name, value });
    }}
    Switch={DefaultSwitch}
  />
);
