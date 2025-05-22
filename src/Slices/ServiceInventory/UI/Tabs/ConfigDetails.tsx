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
import { Config, VersionedServiceInstanceIdentifier } from "@/Core";
import { usePostInstanceConfig } from "@/Data/Queries/V2/ServiceInstance";
import { DefaultSwitch, EmptyView, SettingsList } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

interface Props {
  config: Config;
  defaults: Config;
  serviceInstanceIdentifier: VersionedServiceInstanceIdentifier;
}

export const ConfigDetails: React.FC<Props> = ({ config, defaults, serviceInstanceIdentifier }) => {
  const { service_entity, id, version } = serviceInstanceIdentifier;
  const { environmentModifier } = useContext(DependencyContext);
  const { mutate } = usePostInstanceConfig(service_entity, id);
  const isHalted = environmentModifier.useIsHalted();

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
