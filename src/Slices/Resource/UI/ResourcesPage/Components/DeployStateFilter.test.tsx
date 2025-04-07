import React, { useState, act } from 'react';
import { Toolbar, ToolbarContent, ToolbarItem } from '@patternfly/react-core';
import { fireEvent, render, screen } from '@testing-library/react';
import { Resource } from '@/Core';
import { DeployStateFilter } from './DeployStateFilter';

const TestWrapper = () => {
  const [filter, setFilter] = useState<Resource.FilterWithDefaultHandling>({});

  return (
    <Toolbar clearAllFilters={() => setFilter({})}>
      <ToolbarContent>
        <ToolbarItem>
          <DeployStateFilter filter={filter} setFilter={setFilter} />
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};

test('Given the deploy state filter When changing the include/exclude options Then the filter is updated accordingly', async() => {
  render(<TestWrapper />);
  const menuToggle = await screen.findByRole('button', {
    name: 'Deploy State-toggle',
  });

  await act(async() => {
    fireEvent.click(menuToggle);
  });

  // Skipped state, check if no filter is applied by default on that option.
  expect(
    await screen.findByRole('generic', { name: 'skipped-include-inactive' }),
  ).toBeVisible();
  expect(
    await screen.findByRole('generic', { name: 'skipped-exclude-inactive' }),
  ).toBeVisible();

  // Select include for skipped state
  await act(async() => {
    fireEvent.click(
      await screen.findByRole('generic', { name: 'skipped-include-toggle' }),
    );
  });
  await act(async() => {
    fireEvent.click(menuToggle);
  });

  // Check if the include active icon is shown
  expect(
    screen.queryByRole('generic', { name: 'skipped-include-inactive' }),
  ).not.toBeInTheDocument();
  expect(
    await screen.findByRole('generic', { name: 'skipped-include-active' }),
  ).toBeVisible();

  // Select exclude for skipped state
  expect(
    screen.queryByRole('generic', { name: 'skipped-exclude-active' }),
  ).not.toBeInTheDocument();

  await act(async() => {
    fireEvent.click(
      await screen.findByRole('generic', { name: 'skipped-exclude-toggle' }),
    );
  });

  // The include icon inactive one again and the exclude is active
  await act(async() => {
    fireEvent.click(menuToggle);
  });

  expect(
    await screen.findByRole('generic', { name: 'skipped-include-inactive' }),
  ).toBeVisible();
  expect(
    await screen.findByRole('generic', { name: 'skipped-exclude-active' }),
  ).toBeVisible();

  // Include and exclude filters for different options can be combined
  await act(async() => {
    fireEvent.click(
      await screen.findByRole('generic', { name: 'deployed-include-toggle' }),
    );
  });
  await act(async() => {
    fireEvent.click(menuToggle);
  });

  expect(
    await screen.findByRole('generic', { name: 'deployed-include-active' }),
  ).toBeVisible();
  expect(
    await screen.findByRole('generic', { name: 'skipped-exclude-active' }),
  ).toBeVisible();

  // Clicking a toggle again removes that filter
  await act(async() => {
    fireEvent.click(
      await screen.findByRole('generic', { name: 'deployed-include-toggle' }),
    );
  });
  await act(async() => {
    fireEvent.click(menuToggle);
  });

  expect(
    screen.queryByRole('generic', { name: 'deployed-include-active' }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole('generic', { name: 'deployed-include-inactive' }),
  ).toBeVisible();
});
