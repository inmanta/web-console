import React, { useContext } from "react";
import { DependencyContext, words } from "@/UI";
import { PageSectionWithTitle, RemoteDataView } from "@/UI/Components";
import { EnvironmentsOverview } from "./EnvironmentsOverview";

export const Page: React.FC = () => {
  const { queryResolver } = useContext(DependencyContext);
  const [data] = queryResolver.useOneTime<"GetEnvironments">({
    kind: "GetEnvironments",
    details: true,
  });

  return (
    <>
      <PageSectionWithTitle title={words("home.title")} />
      <RemoteDataView
        data={data}
        label="Overview"
        SuccessView={(environments) => (
          <EnvironmentsOverview
            environments={environments}
            aria-label="Overview-Success"
          />
        )}
      />
    </>
  );
};
