import React from "react";
import { words } from "@/UI/words";
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";
import { Callback, stringifyList } from "@/Core";
import styled from "styled-components";

type Props = Pick<Callback, "minimal_log_level" | "event_types">;

export const Details: React.FC<Props> = ({
  minimal_log_level,
  event_types,
}) => {
  return (
    <StyledDescriptionList isHorizontal isAutoColumnWidths>
      <DescriptionListGroup>
        <DescriptionListTerm>
          {words("catalog.callbacks.minimalLogLevel")}
        </DescriptionListTerm>
        <DescriptionListDescription>
          {minimal_log_level}
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>
          {words("catalog.callbacks.eventTypes")}
        </DescriptionListTerm>
        <DescriptionListDescription>
          {stringifyList(event_types || [])}
        </DescriptionListDescription>
      </DescriptionListGroup>
    </StyledDescriptionList>
  );
};

const StyledDescriptionList = styled(DescriptionList)`
  --pf-c-description-list--m-horizontal__term--width: 20ch;
`;
