import React from "react";
import copy from "copy-to-clipboard";
import { Tooltip } from "@patternfly/react-core";
import { CopyIcon } from "@patternfly/react-icons";
import { Id } from "@/Core";
import { words } from "@/UI";

interface Props {
  id: Id;
}

export const IdWithCopy: React.FC<Props> = ({ id }) => {
  return (
    <>
      {id.short}
      <Tooltip content={words("id.copy")}>
        <CopyIcon style={{ paddingLeft: 5 }} onClick={() => copy(id.full)} />
      </Tooltip>
    </>
  );
};
