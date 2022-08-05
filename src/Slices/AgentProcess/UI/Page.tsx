import React, { useContext } from "react";
import { PageSection } from "@patternfly/react-core";
import { RemoteDataView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { useRouteParams } from "@/UI/Routing";
import { AgentProcessDetails } from "./AgentProcessDetails";

export const Page: React.FC = () => {
  const { id } = useRouteParams<"AgentProcess">();
  const { queryResolver } = useContext(DependencyContext);

  const [data] = queryResolver.useOneTime<"GetAgentProcess">({
    kind: "GetAgentProcess",
    id,
  });

  return (
    <PageSection variant="light">
      <RemoteDataView
        data={data}
        label="AgentProcessView"
        SuccessView={(data) => (
          <AgentProcessDetails
            agentProcess={data}
            aria-label="AgentProcessView-Success"
          />
        )}
      />
    </PageSection>
  );
};
