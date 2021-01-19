import React from "react";
import copy from "copy-to-clipboard";
import { Tooltip } from "@patternfly/react-core";
import { CopyIcon } from "@patternfly/react-icons";
import { Id } from "@/Core";

interface Props {
  id: Id;
}

export const IdWithCopy: React.FC<Props> = ({ id }) => {
  return (
    <>
      {id.short}
      <Tooltip content="Copy full service instance id to clipboard">
        <CopyIcon style={{ paddingLeft: 5 }} onClick={() => copy(id.full)} />
      </Tooltip>
    </>
  );
};
