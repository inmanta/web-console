import React from "react";
import { useRouteParams } from "@/UI/Routing";

export const Page: React.FC = () => {
  const { sourceVersion, targetVersion } =
    useRouteParams<"DesiredStateCompare">();

  return (
    <p>
      {sourceVersion} + {targetVersion}
    </p>
  );
};
