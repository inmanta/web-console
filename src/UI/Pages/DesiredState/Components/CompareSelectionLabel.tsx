import React from "react";
import { Button } from "@patternfly/react-core";
import { TimesIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { Maybe } from "@/Core";
import { words } from "@/UI/words";
import { CompareSelection } from "../Utils";

interface Props {
  onDelete(): void;
  selection: CompareSelection;
}

export const CompareSelectionLabel: React.FC<Props> = ({
  selection,
  onDelete,
}) => (
  <Container>
    <Title>{words("desiredState.compare.selectionLabel")}</Title>
    <Selection>
      <SelectionText>
        {Maybe.isSome(selection) && (
          <>
            <b>{selection.value}</b> &amp;
          </>
        )}{" "}
        ...
      </SelectionText>
      {Maybe.isSome(selection) && (
        <SelectionAction onClick={onDelete} variant="plain">
          <TimesIcon size="sm" />
        </SelectionAction>
      )}
    </Selection>
  </Container>
);

const Container = styled.div`
  display: inline-flex;
  font-size: var(--pf-global--FontSize--md);
  line-height: 24px;
  height: 36px;
  padding: 6px 6px 6px 8px;
  background-color: var(--pf-global--BackgroundColor--200);
`;

const Title = styled.span`
  display: inline-block;
  margin-right: 8px;
`;

const Selection = styled.div`
  background-color: var(--pf-global--BackgroundColor--100);
  border-radius: 3px;
  font-size: var(--pf-global--FontSize--sm);
`;

const SelectionText = styled.span`
  padding: 0 4px;
`;

const SelectionAction = styled(Button)`
  padding: 0 4px;
  line-height: 24px;
`;
