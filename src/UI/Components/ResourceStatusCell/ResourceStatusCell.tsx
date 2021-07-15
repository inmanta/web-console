import { CheckSquareIcon, TimesCircleIcon } from "@patternfly/react-icons";
import React from "react";

export const ResourceStatusCell: React.FC<{ state: string }> = ({ state }) => {
  switch (state) {
    case "deployed":
      return (
        <>
          <CheckSquareIcon color="#06c" /> {state}
        </>
      );
    case "failed":
      return (
        <>
          <TimesCircleIcon color="#c9190b" /> {state}
        </>
      );
    default:
      return <>{state}</>;
  }
};
