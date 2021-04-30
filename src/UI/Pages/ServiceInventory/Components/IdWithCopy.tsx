import React from "react";
import { Id } from "@/Core";
import { words } from "@/UI";
import { TextWithCopy } from "@/UI/Components";

interface Props {
  id: Id;
}

export const IdWithCopy: React.FC<Props> = ({ id }) => {
  return (
    <TextWithCopy
      shortText={id.short}
      fullText={id.full}
      tooltipContent={words("id.copy")}
    />
  );
};
