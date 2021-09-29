import { RemoteData } from "@/Core";
import { ErrorView, LoadingView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import React, { useContext } from "react";
import { CompileDetailsSections } from "./CompileDetailsSections";

interface Props {
  id: string;
}

export const CompileDetails: React.FC<Props> = ({ id }) => {
  const { queryResolver } = useContext(DependencyContext);

  const [data] = queryResolver.useContinuous<"CompileDetails">({
    kind: "CompileDetails",
    id,
  });

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => <LoadingView aria-label="CompileDetailsView-Loading" />,
      failed: (error) => (
        <ErrorView message={error} aria-label="CompileDetailsView-Failed" />
      ),
      success: (data) => (
        <CompileDetailsSections
          compileDetails={data}
          aria-label="CompileDetailsView-Success"
        />
      ),
    },
    data
  );
};
