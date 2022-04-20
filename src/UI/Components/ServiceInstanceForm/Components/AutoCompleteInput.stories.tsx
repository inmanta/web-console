import React, { useState } from "react";
import { AutoCompleteInput } from "./AutoCompleteInput";

export default {
  title: "Service Inventory/AutoCompleteInput",
  component: AutoCompleteInput,
};

export const DefaultWithWrapper = () => {
  const allPossibleOptions = [
    { value: "123", displayName: "test" },
    { value: "abc", displayName: "dummy" },
    { value: "456", displayName: "test2" },
  ];
  const [options, setOptions] = useState<
    {
      value: string;
      displayName: string;
    }[]
  >([]);
  const [value, setValue] = useState("");
  return (
    <AutoCompleteInput
      options={options}
      serviceEntity={"test_entity"}
      attributeName={"test"}
      attributeValue={value}
      isOptional={false}
      handleInputChange={(value) => {
        setValue(value);
      }}
      onSearchTextChanged={(searchText) => {
        if (searchText.length > 0) {
          const filtered = allPossibleOptions.filter(({ displayName }) =>
            displayName.includes(searchText)
          );
          setOptions(filtered);
        }
      }}
    />
  );
};
