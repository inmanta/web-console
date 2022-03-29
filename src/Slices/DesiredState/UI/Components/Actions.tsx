import React, { useState } from "react";
import { Dropdown, KebabToggle } from "@patternfly/react-core";
import { ParsedNumber } from "@/Core";
import { CompareAction } from "./CompareAction";
import { PromoteAction } from "./PromoteAction";

interface Props {
  version: ParsedNumber;
  isPromoteDisabled: boolean;
}

export const Actions: React.FC<Props> = ({ version, isPromoteDisabled }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dropdown
      toggle={<KebabToggle onToggle={() => setIsOpen(!isOpen)} />}
      isOpen={isOpen}
      isPlain
      position="right"
      onSelect={() => setIsOpen(false)}
      dropdownItems={[
        <PromoteAction
          key="promote"
          version={version}
          isDisabled={isPromoteDisabled}
        />,
        <CompareAction key="compare" version={Number(version)} />,
      ]}
    />
  );
};
