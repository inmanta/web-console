import React, { useState } from "react";
import { Maybe } from "@/Core";
import { EditableImageField } from "./EditableImageField";

export default {
  title: "EditableImageField",
  component: EditableImageField,
};

export const Default = () => {
  const [value, setValue] = useState<string | undefined>(undefined);
  const onSubmit = async (dataUrl: string) => {
    console.log({ dataUrl });
    setValue(dataUrl);
    return Maybe.none();
  };

  return (
    <EditableImageField
      label={"Icon"}
      initialValue={value || ""}
      onSubmit={onSubmit}
    />
  );
};
