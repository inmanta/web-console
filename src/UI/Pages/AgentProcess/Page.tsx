import React, { useContext } from "react";
import { RemoteData } from "@/Core";
import { ErrorView, LoadingView, PageContainer } from "@/UI/Components";
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
      {RemoteData.fold(
        {
          notAsked: () => null,
          loading: () => <LoadingView aria-label="AgentProcessView-Loading" />,
          failed: (error) => (
            <ErrorView message={error} aria-label="AgentProcessView-Failed" />
          ),
          success: (data) => (
            <AgentProcessDetails
              agentProcess={data}
              aria-label="AgentProcessView-Success"
            />
          ),
        },
        data
      )}
    </PageContainer>
  );
};
