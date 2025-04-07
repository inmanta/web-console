import React from 'react';
import { Label, LabelGroup } from '@patternfly/react-core';
import { Maybe } from '@/Core';
import { words } from '@/UI/words';
import { CompareSelection } from '../Utils';

interface Props {
  onDelete(): void;
  selection: CompareSelection;
}

export const CompareSelectionLabel: React.FC<Props> = ({
  selection,
  onDelete,
}) => {
  return Maybe.isSome(selection) ? (
    <LabelGroup categoryName={words('desiredState.compare.selectionLabel')}>
      <Label onClose={onDelete}>{selection.value}</Label>
    </LabelGroup>
  ) : null;
};
