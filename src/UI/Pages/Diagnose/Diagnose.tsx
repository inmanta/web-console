import React, { useContext } from "react";
import { DependencyContext } from "@/UI/Dependency";
import { RemoteData, ServiceModel } from "@/Core";
import { EmptyView, ErrorView, LoadingView, Spacer } from "@/UI/Components";
import { words } from "@/UI/words";
import { DiagnoseCardLayout } from "./DiagnoseCardLayout";
import { Text, TextVariants, TextContent } from "@patternfly/react-core";

interface Props {
  service: ServiceModel;
  instanceId: string;
}

export const Diagnose: React.FC<Props> = ({ service, instanceId }) => {
  const { queryResolver } = useContext(DependencyContext);

  const [data] = queryResolver.useContinuous<"Diagnostics">({
    kind: "Diagnostics",
    id: instanceId,
    service_entity: service.name,
  });

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => (
        <LoadingView aria-label="Diagnostics-Loading" delay={500} />
      ),
      failed: (error) => (
        <ErrorView aria-label="Diagnostics-Failed" message={error} />
      ),
      success: (diagnostics) => {
        if (
          diagnostics.failures.length <= 0 &&
          diagnostics.rejections.length === 0
        ) {
          return (
            <div aria-label="Diagnostics-Empty">
              <TextContent>
                <Text component={TextVariants.small}>
                  {words("diagnose.main.subtitle")(instanceId)}
                </Text>
              </TextContent>
              <EmptyView message={words("diagnose.empty")(instanceId)} />
            </div>
          );
        }

        return (
          <div aria-label="Diagnostics-Success">
            <TextContent>
              <Text component={TextVariants.small}>
                {words("diagnose.main.subtitle")(instanceId)}
              </Text>
            </TextContent>
            <Spacer />
            <DiagnoseCardLayout diagnostics={diagnostics} />
          </div>
        );
      },
    },
    data
  );
};
