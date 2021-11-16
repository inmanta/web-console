import React, { useContext } from "react";
import styled from "styled-components";
import { RemoteData } from "@/Core";
import {
  Description,
  ErrorView,
  LoadingView,
  PageSectionWithTitle,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { StatusList } from "./StatusList";

export const Page: React.FC = () => {
  const { urlManager, queryResolver } = useContext(DependencyContext);
  const [data, retry] = queryResolver.useContinuous<"GetServerStatus">({
    kind: "GetServerStatus",
  });

  console.log("StatusPage");

  return (
    <PageSectionWithTitle title={words("status.title")}>
      <Description>{words("status.description")}</Description>
      {RemoteData.fold(
        {
          notAsked: () => null,
          loading: () => <LoadingView aria-label="ServerStatus-Loading" />,
          failed: (error) => (
            <ErrorView
              message={error}
              retry={retry}
              aria-label="ServerStatus-Failed"
            />
          ),
          success: (status) => (
            <PaddedStatusList status={status} apiUrl={urlManager.getApiUrl()} />
          ),
        },
        data
      )}
    </PageSectionWithTitle>
  );
};

const PaddedStatusList = styled(StatusList)`
  margin-top: 16px;
`;
