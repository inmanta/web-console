import { RemoteData } from "@/Core";
import { DependencyContext } from "@/UI";
import { ErrorView, LoadingView, PageSectionWithTitle } from "@/UI/Components";
import React, { useContext } from "react";
import { Form } from "./Form";

export const Provider: React.FC = () => {
  const { queryResolver } = useContext(DependencyContext);
  const [data] = queryResolver.useOneTime<"Projects">({ kind: "Projects" });
  return (
    <PageSectionWithTitle title={"Create Environment"}>
      {RemoteData.fold(
        {
          notAsked: () => null,
          loading: () => <LoadingView aria-label="CreateEnvironment-Loading" />,
          failed: (message) => (
            <ErrorView
              message={message}
              aria-label="CreateEnvironment-Failed"
            />
          ),
          success: (projects) => (
            <Form projects={projects} aria-label="CreateEnvironment-Success" />
          ),
        },
        data
      )}
    </PageSectionWithTitle>
  );
};
