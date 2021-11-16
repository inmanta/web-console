import React, { useContext } from "react";
import styled from "styled-components";
import { Description, PageSectionWithTitle } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { StatusList } from "./StatusList";

export const Page: React.FC = () => {
  const { urlManager, statusManager } = useContext(DependencyContext);
  return (
    <PageSectionWithTitle title={words("status.title")}>
      <Description>{words("status.description")}</Description>
      <PaddedStatusList
        status={statusManager.getServerStatus()}
        apiUrl={urlManager.getApiUrl()}
      />
    </PageSectionWithTitle>
  );
};

const PaddedStatusList = styled(StatusList)`
  margin-top: 16px;
`;
