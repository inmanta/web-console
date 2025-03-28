import React, { useContext } from "react";
import { Flex, FlexItem } from "@patternfly/react-core";
import { useGetServerStatus } from "@/Data/Managers/V2/Server/GetServerStatus";
import {
  Description,
  ErrorView,
  LoadingView,
  PageContainer,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { StatusList } from "./StatusList";
import { SupportArchive } from "./SupportArchive";

export const Page: React.FC = () => {
  const { urlManager } = useContext(DependencyContext);
  const { data, isError, error, isSuccess, refetch } =
    useGetServerStatus().useContinuous();

  if (isError) {
    return (
      <Wrapper>
        <ErrorView
          message={error.message}
          retry={refetch}
          ariaLabel="ServerStatus-Error"
        />
      </Wrapper>
    );
  }

  if (isSuccess) {
    return (
      <Wrapper>
        <StatusList
          status={data}
          apiUrl={urlManager.getApiUrl()}
          aria-label="ServerStatus-Success"
        />
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <LoadingView aria-label="ServerStatus-Loading" />
    </Wrapper>
  );
};

const Wrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { featureManager } = useContext(DependencyContext);

  return (
    <PageContainer pageTitle={words("status.title")}>
      <Flex justifyContent={{ default: "justifyContentSpaceBetween" }}>
        <FlexItem>
          <Description>{words("status.description")}</Description>
        </FlexItem>
        {featureManager.isSupportEnabled() && (
          <FlexItem>
            <SupportArchive />
          </FlexItem>
        )}
      </Flex>
      {children}
    </PageContainer>
  );
};
