import { RemoteData } from "@/Core";
import { DependencyContext } from "@/UI";
import { ErrorView } from "@/UI/Components";
import React, { useContext } from "react";
import { Tab } from "./Tab";

export const Provider: React.FC = () => {
  const { queryResolver } = useContext(DependencyContext);
  const [data] = queryResolver.useOneTime<"Projects">({ kind: "Projects" });
  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => null,
      failed: (message) => <ErrorView message={message} />,
      success: (projects) => {
        return <Tab projects={projects} />;
      },
    },
    data
  );
};
