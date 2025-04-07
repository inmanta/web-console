import React, { useContext } from 'react';
import { Config } from '@/Core';
import { usePostServiceConfig } from '@/Data/Managers/V2/Service';
import { BooleanSwitch, EmptyView, SettingsList } from '@/UI/Components';
import { DependencyContext } from '@/UI/Dependency';
import { words } from '@/UI/words';

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
  const { environmentModifier } = useContext(DependencyContext);
  const { mutate } = usePostServiceConfig(serviceName);
  const isHalted = environmentModifier.useIsHalted();

  return Object.keys(config).length <= 0 ? (
    <EmptyView message={words('config.empty')} />
  ) : (
    <SettingsList
      config={config}
      onChange={(name, value) => mutate({ values: { [name]: value } })}
      Switch={BooleanSwitch}
      isDisabled={isHalted}
    />
  );
};
