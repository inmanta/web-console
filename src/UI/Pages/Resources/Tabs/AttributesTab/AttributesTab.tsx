import React, { useContext } from "react";
import { RemoteData } from "@/Core";
import { ErrorView, LoadingView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

interface Props {
  id: string;
}

export const AttributesTab: React.FC<Props> = ({ id }) => {
  const { queryResolver } = useContext(DependencyContext);

  const [data] = queryResolver.useContinuous<"ResourceDetails">({
    kind: "ResourceDetails",
    id,
  });

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => (
        <LoadingView delay={500} aria-label="ResourceAttributes-Loading" />
      ),
      failed: (error) => (
        <ErrorView
          aria-label="ResourceAttributes-Failed"
          title={words("resources.details.failed.title")}
          message={words("resources.details.failed.body")(error)}
        />
      ),
      success: (resource) => (
        <pre>
          <code>{JSON.stringify(resource, null, 4)}</code>
        </pre>
      ),
    },
    data
  );
};
