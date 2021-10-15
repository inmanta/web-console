import { ProjectModel, RemoteData } from "@/Core";
import { DependencyContext } from "@/UI";
import { ErrorView, LoadingView } from "@/UI/Components";
import React, { useContext } from "react";

interface Props {
  projects: ProjectModel[];
}

export const Tab: React.FC<Props> = ({}) => {
  const { queryResolver } = useContext(DependencyContext);
  const [data] = queryResolver.useContinuous<"EnvironmentDetails">({
    kind: "EnvironmentDetails",
  });

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => <LoadingView aria-label="Environment-Loading" />,
      failed: (error) => (
        <ErrorView aria-label="Environment-Failed" message={error} />
      ),
      success: () => {
        return <></>;
        // return (
        //   <EnvironmentSettings
        //     projects={projects}
        //     environment={selected}
        //   />
        // );
      },
    },
    data
  );
  return <></>;
};
