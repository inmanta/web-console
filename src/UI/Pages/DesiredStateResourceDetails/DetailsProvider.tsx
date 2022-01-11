import React, { useContext } from "react";
import { RemoteData } from "@/Core";
import { ErrorView, LoadingView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { Details } from "./Details";

interface Props {
  resourceId: string;
}

export const DetailsProvider: React.FC<Props> = ({ resourceId: id }) => {
  const { queryResolver } = useContext(DependencyContext);

  const [data] = queryResolver.useContinuous<"GetResourceDetails">({
    kind: "GetResourceDetails",
    id,
  });

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => <LoadingView aria-label="ResourceDetails-Loading" />,
      failed: (error) => (
        <ErrorView
          aria-label="ResourceDetails-Failed"
          title={words("resources.requires.failed.title")}
          message={words("resources.requires.failed.body")(error)}
        />
      ),
      success: (details) => (
        <Details details={details} aria-label="ResourceDetails-Success" />
      ),
    },
    data
  );
};
