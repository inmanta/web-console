import React from "react";
import { DefaultSwitch } from "@/UI/Components";
import { SettingsList } from "./SettingsList";
import { Config } from "@/Core";

export default {
  title: "SettingsList",
  component: SettingsList,
};

const config: Config = {
  auto_update_designed: false,
  auto_designed: false,
  auto_creating: true,
  auto_update_inprogress: true,
};

const defaults: Config = {
  auto_update_designed: false,
  auto_designed: false,
  auto_creating: false,
  auto_update_inprogress: false,
};

export const Default: React.FC = () => (
  <SettingsList
    config={config}
    onChange={(name, value) => {
      console.log({ name, value });
    }}
    Switch={(props) => <DefaultSwitch {...props} defaults={defaults} />}
  />
);
