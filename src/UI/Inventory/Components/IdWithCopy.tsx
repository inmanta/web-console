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
    <span className="only-on-hover-container">
      {id.short}
      <Tooltip content={words("id.copy")}>
        <CopyIcon
          className="only-on-hover-visible"
          style={{ paddingLeft: 5 }}
          onClick={() => copy(id.full)}
        />
      </Tooltip>
    </span>
  );
};
