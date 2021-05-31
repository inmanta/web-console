import { RemoteData, VersionedServiceInstanceIdentifier } from "@/Core";
import {
  ConfigToggleList,
  EmptyView,
  ErrorView,
  LoadingView,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import {
  Button,
  Card,
  CardActions,
  CardBody,
  CardHeader,
  Tooltip,
} from "@patternfly/react-core";
import React, { useContext } from "react";

interface Props {
  serviceInstanceIdentifier: VersionedServiceInstanceIdentifier;
}

export const DisabledConfigTab: React.FC = () => (
  <Card>
    <CardBody>
      <EmptyView message={words("config.disabled")} />
    </CardBody>
  </Card>
);

export const ConfigTab: React.FC<Props> = ({ serviceInstanceIdentifier }) => {
  const { commandResolver, queryResolver } = useContext(DependencyContext);
  const [data, retry] = queryResolver.useOneTime<"InstanceConfig">({
    kind: "InstanceConfig",
    ...serviceInstanceIdentifier,
  });

  const trigger = commandResolver.getTrigger<"InstanceConfig">({
    kind: "InstanceConfig",
    ...serviceInstanceIdentifier,
  });

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => <LoadingView />,
      failed: (error) => <ErrorView message={error} retry={retry} />,
      success: (settings) =>
        settings.length <= 0 ? (
          <Card>
            <CardBody>
              <EmptyView message={words("config.empty")} />
            </CardBody>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardActions>
                <Tooltip
                  content={words("config.reset.description")}
                  entryDelay={200}
                >
                  <Button isSmall onClick={() => trigger({ kind: "RESET" })}>
                    {words("config.reset")}
                  </Button>
                </Tooltip>
              </CardActions>
            </CardHeader>
            <CardBody>
              <ConfigToggleList
                settings={settings}
                onChange={(option, value) =>
                  trigger({ kind: "UPDATE", option, value })
                }
              />
            </CardBody>
          </Card>
        ),
    },
    data
  );
};
