import { RemoteData } from "@/Core";
import { DependencyContext, words } from "@/UI";
import { ErrorView, LoadingView, PageSectionWithTitle } from "@/UI/Components";
import React, { useContext } from "react";
import { EnvironmentsOverview } from "./EnvironmentsOverview";

export const Home: React.FC = () => {
  const { queryResolver } = useContext(DependencyContext);
  const [data] = queryResolver.useOneTime<"GetEnvironments">({
    kind: "GetEnvironments",
  });

  return (
    <>
      <PageSectionWithTitle title={words("home.title")} />
      {RemoteData.fold(
        {
          notAsked: () => null,
          loading: () => <LoadingView aria-label="Overview-Loading" />,
          failed: (message) => (
            <ErrorView message={message} aria-label="Overview-Failed" />
          ),
          success: (environments) => (
            <EnvironmentsOverview
              environments={environments}
              aria-label="Overview-Success"
            />
          ),
        },
        data
      )}
    </>
  );
};
