import React, { useContext } from "react";
import { Flex, FlexItem } from "@patternfly/react-core";
import styled from "styled-components";
import { Description, PageContainer, RemoteDataView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { StatusList } from "./StatusList";
import { SupportArchive } from "./SupportArchive";

export const Page: React.FC = () => {
  const { urlManager, queryResolver, featureManager } =
    useContext(DependencyContext);
  const [data, retry] = queryResolver.useContinuous<"GetServerStatus">({
    kind: "GetServerStatus",
  });

  return (
    <PageContainer title={words("status.title")}>
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

      <RemoteDataView
        data={data}
        retry={retry}
        label="ServerStatus"
        SuccessView={(status) => (
          <PaddedStatusList status={status} apiUrl={urlManager.getApiUrl()} />
        )}
      />
    </PageContainer>
  );
};

const PaddedStatusList = styled(StatusList)`
  margin-top: 16px;
`;
