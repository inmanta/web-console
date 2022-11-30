import React, { useContext } from "react";
import { Config } from "@/Core";
import { BooleanSwitch, EmptyView, SettingsList } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

interface Props {
  config: Config;
  serviceName: string;
}

export const ConfigList: React.FC<Props> = ({ config, serviceName }) => {
  const { commandResolver, environmentModifier } =
    useContext(DependencyContext);
  const update = commandResolver.useGetTrigger<"UpdateServiceConfig">({
    kind: "UpdateServiceConfig",
    name: serviceName,
  });
  const isHalted = environmentModifier.useIsHalted();
  return Object.keys(config).length <= 0 ? (
    <EmptyView message={words("config.empty")} />
  ) : (
    <SettingsList
      config={config}
      onChange={update}
      Switch={BooleanSwitch}
      isDisabled={isHalted}
    />
  );
};
