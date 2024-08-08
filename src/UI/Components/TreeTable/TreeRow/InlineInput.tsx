import React from "react";
import {
  Button,
  Icon,
  Switch,
  TextInput,
  TextInputTypes,
} from "@patternfly/react-core";
import { CheckIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { words } from "@/UI/words";
import { TextListFormInput } from "../../ServiceInstanceForm/Components/TextListFormInput";

const InlineInput = ({
  label,
  value,
  type,
  onChange,
  toggleModal,
}: {
  label: string;
  value: string | number | boolean | string[];
  type: string;
  onChange: (
    event: React.FormEvent<HTMLInputElement> | null,
    value: string | number | boolean | string[],
  ) => void;
  toggleModal: () => void;
}) => {
  let input;
  if (type.includes("bool")) {
    input = (
      <StyledSwitch
        isChecked={value.toString().toLowerCase() === "true"}
        onChange={(event, checked) => onChange(event, checked)}
        aria-label={`new-attribute-toggle-${label}`}
      />
    );
  } else if (type.includes("string[]")) {
    let formattedValue;
    if (typeof value !== "object") {
      formattedValue = (value as string).replace(/\s/g, "").split(",");
    } else {
      formattedValue = value;
    }
    input = (
      <StyledTextForm
        aria-label="new-attribute-input"
        attributeValue={formattedValue as string[]}
        isOptional={true}
        type={TextInputTypes.text}
        handleInputChange={(value, event) => onChange(event, value)}
        placeholder={words("inventory.editAttribute.placeholder")}
        attributeName={""}
      />
    );
  } else {
    input = (
      <StyledInput
        value={value as string | number | undefined}
        type={type.toLowerCase().includes("int") ? "number" : "text"}
        onChange={(event, value) => onChange(event, value)}
        aria-label="new-attribute-input"
        placeholder={words("inventory.editAttribute.placeholder")}
      />
    );
  }

  return (
    <>
      {" "}
      {input}
      <Button
        data-testid="inline-submit"
        variant="link"
        isDanger
        onClick={toggleModal}
      >
        <Icon status="danger">
          <CheckIcon />
        </Icon>
      </Button>
    </>
  );
};

export default InlineInput;

const StyledInput = styled(TextInput)`
  max-width: 200px;
`;

const StyledSwitch = styled(Switch)`
  --pf-v5-c-switch__input--focus__toggle--OutlineWidth: 0;
  --pf-v5-c-switch__input--checked__toggle--BackgroundColor: var(
    --pf-v5-global--danger-color--100
  );
`;
const StyledTextForm = styled(TextListFormInput)`
  display: inline-block;
  width: 350px;
`;
