import React, { useContext } from "react";
import { BooleanSwitch } from "@/UI/Components/BooleanSwitch";
import { SettingsList } from "@/UI/Components/SettingsList";
import { Config, words } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { usePostServiceConfig } from "@inmanta/web-console-core/Queries/Slices/Service";
import { EmptyView } from "@inmanta/web-console-ui/Components/EmptyView";

interface Props {
  config: Config;
  serviceName: string;
}

/**
 * `ConfigList` is a React functional component that displays a list of configuration settings
 * for a given service entity. If the configuration is empty, it shows an empty view message.
 *
 * @props {Props} props - The properties object.
 * @prop {Config} config - The configuration object containing key-value pairs of settings.
 * @prop {string} serviceName - The identifier of the service entity for which the configuration is displayed.
 *
 * @returns {React.FC<Pops>} A rendered list of settings or an empty view message.
 */
export const ConfigList: React.FC<Props> = ({ config, serviceName }) => {
  const { environmentHandler } = useContext(DependencyContext);
  const { mutate } = usePostServiceConfig(serviceName);
  const isHalted = environmentHandler.useIsHalted();

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
