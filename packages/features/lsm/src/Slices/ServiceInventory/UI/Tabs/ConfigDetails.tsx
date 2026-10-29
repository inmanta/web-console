import React, { useContext, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardExpandableContent,
  CardHeader,
  Title,
  Tooltip,
} from "@patternfly/react-core";
import { Config, VersionedServiceInstanceIdentifier, words } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { usePostInstanceConfig } from "@inmanta/web-console-core/Queries/Slices/ServiceInstance";
import { DefaultSwitch } from "@inmanta/web-console-feature-lsm/Components/DefaultSwitch";
import { SettingsList } from "@inmanta/web-console-feature-lsm/Components/SettingsList";
import { EmptyView } from "@inmanta/web-console-ui/Components/EmptyView";

interface Props {
  config: Config;
  defaults: Config;
  serviceInstanceIdentifier: VersionedServiceInstanceIdentifier;
}

export const ConfigDetails: React.FC<Props> = ({ config, defaults, serviceInstanceIdentifier }) => {
  const { service_entity, id, version } = serviceInstanceIdentifier;
  const { environmentHandler } = useContext(DependencyContext);
  const { mutate } = usePostInstanceConfig(service_entity, id);
  const isHalted = environmentHandler.useIsHalted();

  const [isExpanded, setIsExpanded] = useState(true);

  const onExpand = (_event: React.MouseEvent, _id: string) => {
    setIsExpanded(!isExpanded);
  };

  return Object.keys(config).length <= 0 ? (
    <Card isPlain>
      <CardBody>
        <EmptyView message={words("config.empty")} />
      </CardBody>
    </Card>
  ) : (
    <Card isExpanded={isExpanded}>
      <CardHeader
        onExpand={onExpand}
        isToggleRightAligned
        toggleButtonProps={{
          id: "toggle-button-config",
          "aria-label": "Config",
          "aria-labelledby": "config-expandable-card toggle-button-config",
          "aria-expanded": isExpanded,
        }}
        actions={{
          actions: (
            <>
              <Tooltip content={words("config.reset.description")} entryDelay={200}>
                <Button
                  size="sm"
                  onClick={() =>
                    mutate({
                      current_version: Number(version),
                      values: defaults,
                    })
                  }
                >
                  {words("config.reset")}
                </Button>
              </Tooltip>
            </>
          ),
          hasNoOffset: false,
          className: undefined,
        }}
      >
        <Title headingLevel="h2">Config</Title>
      </CardHeader>
      <CardExpandableContent>
        <CardBody>
          <SettingsList
            config={config}
            onChange={(option, value) =>
              mutate({
                current_version: Number(version),
                values: { [option]: value },
              })
            }
            Switch={(props) => <DefaultSwitch {...props} defaults={defaults} />}
            isDisabled={isHalted}
          />
        </CardBody>
      </CardExpandableContent>
    </Card>
  );
};
