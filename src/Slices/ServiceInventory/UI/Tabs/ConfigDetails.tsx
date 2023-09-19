import React, { useContext } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Tooltip,
} from "@patternfly/react-core";
import { Config, VersionedServiceInstanceIdentifier } from "@/Core";
import { DefaultSwitch, EmptyView, SettingsList } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

interface Props {
  config: Config;
  defaults: Config;
  serviceInstanceIdentifier: VersionedServiceInstanceIdentifier;
}

export const ConfigDetails: React.FC<Props> = ({
  config,
  defaults,
  serviceInstanceIdentifier,
}) => {
  const { commandResolver, environmentModifier } =
    useContext(DependencyContext);
  const trigger = commandResolver.useGetTrigger<"UpdateInstanceConfig">({
    kind: "UpdateInstanceConfig",
    ...serviceInstanceIdentifier,
  });
  const isHalted = environmentModifier.useIsHalted();

  return Object.keys(config).length <= 0 ? (
    <Card>
      <CardBody>
        <EmptyView message={words("config.empty")} />
      </CardBody>
    </Card>
  ) : (
    <Card>
      <CardHeader
        actions={{
          actions: (
            <>
              <Tooltip
                content={words("config.reset.description")}
                entryDelay={200}
              >
                <Button size="sm" onClick={() => trigger({ kind: "RESET" })}>
                  {words("config.reset")}
                </Button>
              </Tooltip>
            </>
          ),
          hasNoOffset: false,
          className: undefined,
        }}
      ></CardHeader>
      <CardBody>
        <SettingsList
          config={config}
          onChange={(option, value) =>
            trigger({ kind: "UPDATE", option, value })
          }
          Switch={(props) => <DefaultSwitch {...props} defaults={defaults} />}
          isDisabled={isHalted}
        />
      </CardBody>
    </Card>
  );
};
