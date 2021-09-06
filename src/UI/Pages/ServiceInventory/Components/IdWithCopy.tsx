import React from "react";
import { Id } from "@/Core";
import { words } from "@/UI/words";
import { TextWithCopy } from "@/UI/Components";

interface Props {
  id: Id;
}

export const IdWithCopy: React.FC<Props> = ({ id }) => {
  return (
    <TextWithCopy value={id.full} tooltipContent={words("id.copy")}>
      {id.short}
    </TextWithCopy>
  );
};
