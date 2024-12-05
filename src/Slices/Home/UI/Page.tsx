import React, { useContext } from "react";
import { PageSection } from "@patternfly/react-core";
import { RemoteData } from "@/Core";
import { DependencyContext, words } from "@/UI";
import { ErrorView, LoadingView, PageSectionWithTitle } from "@/UI/Components";
import { EnvironmentsOverview } from "./EnvironmentsOverview";
import { EmptyFilterToolbar } from "./FilterToolbar";

export const Page: React.FC = () => {
  const { queryResolver } = useContext(DependencyContext);
  const [data] = queryResolver.useContinuous<"GetEnvironmentsContinuous">({
    kind: "GetEnvironmentsContinuous",
    details: true,
  });

  return (
    <>
      <PageSectionWithTitle title={words("home.title")} />
      {RemoteData.fold(
        {
          notAsked: () => null,
          loading: () => (
            <>
              <EmptyFilterToolbar />
              <PageSection hasBodyWrapper={false}>
                <LoadingView ariaLabel="Overview-Loading" />
              </PageSection>
            </>
          ),
          failed: (error) => (
            <>
              <EmptyFilterToolbar />
              <PageSection hasBodyWrapper={false}>
                <ErrorView
                  title={words("error")}
                  message={words("error.general")(error)}
                  ariaLabel="Overview-Failed"
                />
              </PageSection>
            </>
          ),
          success: (environments) => (
            <EnvironmentsOverview
              environments={environments}
              aria-label="Overview-Success"
            />
          ),
        },
        data,
      )}
    </>
  );
};
