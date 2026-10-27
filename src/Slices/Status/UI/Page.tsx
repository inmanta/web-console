import React, { PropsWithChildren, useContext } from "react";
import { Flex, FlexItem } from "@patternfly/react-core";
import { words } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { useGetServerStatus } from "@inmanta/web-console-core/Queries/Slices/Server";
import { Description } from "@inmanta/web-console-ui/Components/Description";
import { ErrorView } from "@inmanta/web-console-ui/Components/ErrorView";
import { LoadingView } from "@inmanta/web-console-ui/Components/LoadingView";
import { PageContainer } from "@inmanta/web-console-ui/Components/PageContainer";
import { StatusList } from "./StatusList";
import { SupportArchive } from "./SupportArchive";

/**
 * Status page
 *
 * @returns {React.FC} The Status page
 */
export const Page: React.FC = () => {
  const { urlManager } = useContext(DependencyContext);
  const { data, isSuccess, isError, error, refetch } = useGetServerStatus().useContinuous();

  if (isError) {
    return (
      <Wrapper>
        <ErrorView message={error.message} retry={refetch} ariaLabel="ServerStatus-Error" />;
      </Wrapper>
    );
  }

  if (isSuccess) {
    return (
      <Wrapper>
        <StatusList status={data} apiUrl={urlManager.getApiUrl()} />
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <LoadingView ariaLabel="ServerStatus-Loading" />
    </Wrapper>
  );
};

/**
 * Wrapper for the Status page
 *
 * @returns {React.FC<PropsWithChildren>} The Wrapper
 */
const Wrapper: React.FC<PropsWithChildren> = ({ children }: PropsWithChildren) => {
  const { orchestratorProvider } = useContext(DependencyContext);

  return (
    <PageContainer pageTitle={words("status.title")}>
      <Flex justifyContent={{ default: "justifyContentSpaceBetween" }}>
        <FlexItem>
          <Description>{words("status.description")}</Description>
        </FlexItem>
        {orchestratorProvider.isSupportEnabled() && (
          <FlexItem>
            <SupportArchive />
          </FlexItem>
        )}
      </Flex>
      {children}
    </PageContainer>
  );
};
