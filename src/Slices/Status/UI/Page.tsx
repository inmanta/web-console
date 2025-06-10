import React, { PropsWithChildren, useContext } from "react";
import { Flex, FlexItem } from "@patternfly/react-core";
import { useGetServerStatus } from "@/Data/Queries";
import { Description, ErrorView, LoadingView, PageContainer } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
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
