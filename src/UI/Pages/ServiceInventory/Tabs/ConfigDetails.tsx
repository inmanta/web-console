import React, { useContext } from "react";
import {
  Button,
  Card,
  CardActions,
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
  const trigger = commandResolver.getTrigger<"UpdateInstanceConfig">({
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
      <CardHeader>
        <CardActions>
          <Tooltip content={words("config.reset.description")} entryDelay={200}>
            <Button isSmall onClick={() => trigger({ kind: "RESET" })}>
              {words("config.reset")}
            </Button>
          </Tooltip>
        </CardActions>
      </CardHeader>
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
