import React, { useContext } from "react";
import { RemoteDataView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { FactsTable } from "./FactsTable";

interface Props {
  resourceId: string;
}

export const FactsTab: React.FC<Props> = ({ resourceId }) => {
  const { queryResolver } = useContext(DependencyContext);

  const [data] = queryResolver.useContinuous<"GetResourceFacts">({
    kind: "GetResourceFacts",
    resourceId,
  });

  return (
    <RemoteDataView
      data={data}
      label="Facts"
      SuccessView={(facts) => <FactsTable facts={facts} />}
    />
  );
};
