import React, { useContext } from "react";
import { DependencyContext } from "@/UI/Dependency";
import { RemoteData, ServiceModel } from "@/Core";
import { EmptyView, ErrorView, LoadingView } from "@/UI/Components";
import { words } from "@/UI/words";
import { DiagnoseCardLayout } from "./DiagnoseCardLayout";
import { Card, CardTitle, Title } from "@patternfly/react-core";

interface Props {
  service: ServiceModel;
  instanceId: string;
  environment: string;
}

export const Diagnose: React.FC<Props> = ({
  service,
  instanceId,
  environment,
}) => {
  const { dataProvider } = useContext(DependencyContext);

  const [data] = dataProvider.useContinuous<"Diagnostics">({
    kind: "Diagnostics",
    qualifier: {
      environment,
      id: instanceId,
      service_entity: service.name,
    },
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
              <Card>
                <CardTitle>
                  <Title headingLevel="h4" size="xl">
                    {words("diagnose.main.title")(instanceId)}
                  </Title>
                </CardTitle>
              </Card>
              <EmptyView message={words("diagnose.empty")(instanceId)} />
            </div>
          );
        }

        return (
          <div aria-label="Diagnostics-Success">
            <Card>
              <CardTitle>
                <Title headingLevel="h4" size="xl">
                  {words("diagnose.main.title")(instanceId)}
                </Title>
              </CardTitle>
            </Card>
            <DiagnoseCardLayout
              diagnostics={diagnostics}
              environment={environment}
            />
          </div>
        );
      },
    },
    data
  );
};
