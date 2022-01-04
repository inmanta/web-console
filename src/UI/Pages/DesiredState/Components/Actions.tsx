import React, { useState } from "react";
import { Dropdown, DropdownItem, KebabToggle } from "@patternfly/react-core";
import { InfoCircleIcon } from "@patternfly/react-icons";
import { useNavigateTo } from "@/UI/Routing";
import { words } from "@/UI/words";
import { CompareAction } from "./CompareAction";
import { PromoteAction } from "./PromoteAction";

interface Props {
  version: number;
  isPromoteDisabled: boolean;
}

export const Actions: React.FC<Props> = ({ version, isPromoteDisabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigateTo = useNavigateTo();

  const onDetails = () =>
    navigateTo("DesiredStateDetails", {
      version: version.toString(),
    });

  return (
    <Dropdown
      toggle={<KebabToggle onToggle={() => setIsOpen(!isOpen)} />}
      isOpen={isOpen}
      isPlain
      position="right"
      onSelect={() => setIsOpen(false)}
      dropdownItems={[
        <DropdownItem
          key="details"
          component="button"
          onClick={onDetails}
          icon={<InfoCircleIcon />}
        >
          {words("desiredState.actions.details")}
        </DropdownItem>,
        <PromoteAction
          key="promote"
          version={version}
          isDisabled={isPromoteDisabled}
        />,
        <CompareAction key="compare" version={version} />,
      ]}
    />
  );
};
