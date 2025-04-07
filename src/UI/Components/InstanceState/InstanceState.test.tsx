import React from 'react';
import { render, screen } from '@testing-library/react';
import { InstanceStateLabel } from './InstanceStateLabel';

test('GIVEN State label WHEN (name,label) is (\'up\',\'success\') THEN name is visible', async () => {
  render(<InstanceStateLabel name="up" label="success" />);
  expect(screen.getByText('up')).toBeVisible();
});

test('GIVEN State label WHEN (name,label) is (\'rejected\',\'warning\') THEN name is visible', async () => {
  render(<InstanceStateLabel name="rejected" label="warning" />);
  expect(screen.getByText('rejected')).toBeVisible();
});

test('GIVEN State label WHEN (name,label) is (\'ordered\',undefined) THEN name is visible', async () => {
  render(<InstanceStateLabel name="ordered" />);
  expect(screen.getByText('ordered')).toBeVisible();
});
