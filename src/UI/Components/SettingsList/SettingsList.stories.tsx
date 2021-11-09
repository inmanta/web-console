import React from "react";
import { Config } from "@/Core";
import { DefaultSwitch } from "@/UI/Components";
import { SettingsList } from "./SettingsList";

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
