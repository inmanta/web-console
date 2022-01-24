import React, { useContext } from "react";
import { RemoteDataView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { CompileDetailsSections } from "./CompileDetailsSections";

interface Props {
  id: string;
}

export const CompileDetails: React.FC<Props> = ({ id }) => {
  const { queryResolver } = useContext(DependencyContext);

  const [data] = queryResolver.useContinuous<"GetCompileDetails">({
    kind: "GetCompileDetails",
    id,
  });

  return (
    <RemoteDataView
      data={data}
      label="CompileDetailsView"
      SuccessView={(data) => (
        <CompileDetailsSections
          compileDetails={data}
          aria-label="CompileDetailsView-Success"
        />
      )}
    />
  );
};
