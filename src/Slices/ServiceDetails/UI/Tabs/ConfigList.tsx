import React, { useContext } from "react";
import { Config } from "@/Core";
import { usePostServiceConfig } from "@/Data/Managers/V2/Service";
import { BooleanSwitch, EmptyView, SettingsList } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

interface Props {
  config: Config;
  service_entity: string;
}

export const ConfigList: React.FC<Props> = ({ config, service_entity }) => {
  const { environmentModifier } = useContext(DependencyContext);
  const { mutate } = usePostServiceConfig(service_entity);
  const isHalted = environmentModifier.useIsHalted();

  return Object.keys(config).length <= 0 ? (
    <EmptyView message={words("config.empty")} />
  ) : (
    <SettingsList
      config={config}
      onChange={(name, value) => mutate({ values: { [name]: value } })}
      Switch={BooleanSwitch}
      isDisabled={isHalted}
    />
  );
};
