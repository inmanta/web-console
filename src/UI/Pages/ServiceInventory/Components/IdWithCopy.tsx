import React from "react";
import { Uuid } from "@/Core";
import { words } from "@/UI/words";
import { TextWithCopy } from "@/UI/Components";

interface Props {
  uuid: Uuid;
}

export const IdWithCopy: React.FC<Props> = ({ uuid }) => {
  return (
    <TextWithCopy value={uuid.full} tooltipContent={words("inventory.id.copy")}>
      {uuid.short}
    </TextWithCopy>
  );
};
