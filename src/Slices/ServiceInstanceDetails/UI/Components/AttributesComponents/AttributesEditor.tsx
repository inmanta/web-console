import React, { useEffect, useState } from "react";
import {
  Flex,
  FlexItem,
  FormSelect,
  FormSelectOption,
} from "@patternfly/react-core";
import styled from "styled-components";
import { InstanceAttributeModel } from "@/Core";
import { words } from "@/UI";
import { JSONEditor } from "@/UI/Components/JSONEditor";
import { AttributeSets } from "./Utils";

interface Props {
  dropdownOptions: string[];
  attributeSets: Partial<Record<AttributeSets, InstanceAttributeModel>>;
  service_entity: string;
}

export const AttributesEditor: React.FC<Props> = ({
  dropdownOptions,
  attributeSets,
  service_entity,
}) => {
  const [selectedSet, setSelectedSet] = useState(dropdownOptions[0]);
  const [editorData, setEditorData] = useState<string>("");

  /**
   * Handles the change of the selected attribute Set.
   *
   * @param {React.FormEvent<HTMLSelectElement>} _event
   * @param {string} value
   */
  const onSetSelectionChange = (
    _event: React.FormEvent<HTMLSelectElement>,
    value: string,
  ) => {
    setSelectedSet(value);
  };

  useEffect(() => {
    setEditorData(JSON.stringify(attributeSets[selectedSet], null, 2));
  }, [attributeSets, selectedSet]);

  useEffect(() => {
    // When the version changes, it can happen that the selectedSet isn't available in the dropdown.
    // In that case, we want to fall back to the first option available.
    if (!dropdownOptions.includes(selectedSet)) {
      setSelectedSet(dropdownOptions[0]);
    }
  }, [dropdownOptions, selectedSet]);

  return (
    <>
      <StyledFlexContainer>
        <FlexItem>
          <StyledSelect
            value={selectedSet}
            onChange={onSetSelectionChange}
            aria-label="Select-AttributeSet"
            ouiaId="Select-AttributeSet"
          >
            {dropdownOptions.map((option, index) => (
              <FormSelectOption
                value={option}
                key={index}
                label={words(option as AttributeSets)}
              />
            ))}
          </StyledSelect>
        </FlexItem>
        {/* <FlexItem>Edit button Expert mode</FlexItem> */}
      </StyledFlexContainer>
      <JSONEditor
        data={editorData}
        service_entity={service_entity}
        onChange={() => {
          /** To be implemented with Expert Mode */
        }}
        readOnly
      />
    </>
  );
};

const StyledSelect = styled(FormSelect)`
  width: 180px;
`;

const StyledFlexContainer = styled(Flex)`
  margin-top: var(--pf-v5-global--spacer--md);
  margin-bottom: var(--pf-v5-global--spacer--md);
`;
