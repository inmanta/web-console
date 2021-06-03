import React, { useContext } from "react";
import {
  BooleanSwitch,
  EmptyView,
  ErrorView,
  LoadingView,
  SettingsList,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { RemoteData } from "@/Core";
import { words } from "@/UI/words";
import { Card, CardBody } from "@patternfly/react-core";

interface Props {
  serviceName: string;
}

export const Config: React.FC<Props> = ({ serviceName }) => {
  const { queryResolver, commandResolver } = useContext(DependencyContext);
  const [data, retry] = queryResolver.useOneTime<"ServiceConfig">({
    kind: "ServiceConfig",
    name: serviceName,
  });
  const update = commandResolver.getTrigger<"ServiceConfig">({
    kind: "ServiceConfig",
    name: serviceName,
  });

  return (
    <Card aria-label="ServiceConfig">
      <CardBody>
        {RemoteData.fold(
          {
            notAsked: () => null,
            loading: () => <LoadingView />,
            failed: (error) => <ErrorView message={error} retry={retry} />,
            success: (config) =>
              Object.keys(config).length <= 0 ? (
                <EmptyView message={words("config.empty")} />
              ) : (
                <SettingsList
                  config={config}
                  onChange={update}
                  Switch={BooleanSwitch}
                />
              ),
          },
          data
        )}
      </CardBody>
    </Card>
  );
};
