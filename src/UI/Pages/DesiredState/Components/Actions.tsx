import React, { useContext, useState } from "react";
import { Button, Dropdown, KebabToggle } from "@patternfly/react-core";
import { InfoCircleIcon } from "@patternfly/react-icons";
import { ParsedNumber } from "@/Core";
import { DependencyContext } from "@/UI";
import { Link } from "@/UI/Components";

import { words } from "@/UI/words";
import { CompareAction } from "./CompareAction";
import { PromoteAction } from "./PromoteAction";

interface Props {
  version: ParsedNumber;
  isPromoteDisabled: boolean;
}

export const Actions: React.FC<Props> = ({ version, isPromoteDisabled }) => {
  const { routeManager } = useContext(DependencyContext);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Link
        pathname={routeManager.getUrl("DesiredStateDetails", {
          version: version.toString(),
        })}
      >
        <Button variant="secondary" isSmall icon={<InfoCircleIcon />}>
          {words("desiredState.actions.details")}
        </Button>
      </Link>
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
    </>
  );
};
