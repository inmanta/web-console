import React from "react";
import { Button, Icon, Switch, TextInput } from "@patternfly/react-core";
import { CheckIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { words } from "@/UI/words";
const InlineInput = ({
  label,
  value,
  type,
  onChange,
  toggleModal,
}: {
  label: string;
  value: string | number | boolean;
  type: string;
  onChange: (value: string | number | boolean) => void;
  toggleModal: () => void;
}) => {
  return (
    <>
      {type.toLowerCase().includes("bool") ? (
        <StyledSwitch
          isChecked={value.toString().toLowerCase() === "true"}
          onChange={(checked) => onChange(checked)}
          aria-label={`new-attribute-toggle-${label}`}
        />
      ) : (
        <StyledInput
          value={value.toString()}
          type={type.toLowerCase().includes("int") ? "number" : "text"}
          onChange={(value) => onChange(value)}
          aria-label="new-attribute-input"
          placeholder={words("inventory.editAttribute.placeholder")}
        />
      )}

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
  --pf-c-switch__input--focus__toggle--OutlineWidth: 0;
  --pf-c-switch__input--checked__toggle--BackgroundColor: var(
    --pf-global--danger-color--100
  );
`;
