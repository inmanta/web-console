import { resourceIdToDetails } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import React, { useContext } from "react";

interface Props {
  resourceId: string;
}

export const View: React.FC<Props> = ({ resourceId }) => {
  const { queryResolver } = useContext(DependencyContext);
  const [data] = queryResolver.useContinuous<"ResourceActions">({
    kind: "ResourceActions",
    ...resourceIdToDetails(resourceId),
  });

  return (
    <>
      <pre>
        <code>{JSON.stringify(data, null, 4)}</code>
      </pre>
    </>
  );
};
