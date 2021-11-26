import React, { useContext } from "react";
import { RemoteData } from "@/Core";
import { ErrorView, LoadingView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { FactsTable } from "./FactsTable";

interface Props {
  resourceId: string;
}

export const FactsTab: React.FC<Props> = ({ resourceId }) => {
  const { queryResolver } = useContext(DependencyContext);

  const [data] = queryResolver.useContinuous<"GetFacts">({
    kind: "GetFacts",
    resourceId,
  });

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => <LoadingView delay={500} aria-label="Facts-Loading" />,
      failed: (error) => (
        <ErrorView
          aria-label="Facts-Failed"
          title={words("error")}
          message={words("error.fetch")(error)}
        />
      ),
      success: (facts) => <FactsTable facts={facts} />,
    },
    data
  );
};
