import React from "react";
import { Uuid, words } from "@/Core";
import { TextWithCopy } from "@/UI/Components/TextWithCopy";

interface Props {
  uuid: Uuid;
}

export const IdWithCopy: React.FC<Props> = ({ uuid }) => {
  return (
    <TextWithCopy value={uuid.full} tooltipContent={words("id.copy")}>
      {uuid.short}
    </TextWithCopy>
  );
};
