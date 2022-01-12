import React, { useContext } from "react";
import { PageContainer, RemoteDataView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";
import { AgentProcessDetails } from "./AgentProcessDetails";

export const Page: React.FC = () => {
  const { id } = useRouteParams<"AgentProcess">();
  const { queryResolver } = useContext(DependencyContext);

  const [data] = queryResolver.useOneTime<"GetAgentProcess">({
    kind: "GetAgentProcess",
    id,
  });

  return (
    <PageContainer title={words("agentProcess.title")}>
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
    </PageContainer>
  );
};
