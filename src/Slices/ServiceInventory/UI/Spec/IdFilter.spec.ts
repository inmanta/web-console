import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ServiceInstance } from '@/Test';
import { ServiceInventoryPrepper } from './ServiceInventoryPrepper';
import { filterServer } from './serverSetup';

test('GIVEN The Service Inventory WHEN the user filters on id (\'a\') THEN only 1 instance is shown', async () => {
  filterServer.listen();
  const { component } = new ServiceInventoryPrepper().prep();

  render(component);

  const rowsBefore = await screen.findAllByRole('row', {
    name: 'InstanceRow-Intro',
  });

  expect(rowsBefore.length).toEqual(2);

  const filterBar = screen.getByRole('toolbar', { name: 'FilterBar' });

  const picker = within(filterBar).getByRole('button', {
    name: 'FilterPicker',
  });

  await userEvent.click(picker);

  const id = screen.getByRole('option', { name: 'Id' });

  await userEvent.click(id);

  const input = screen.getByRole('searchbox', { name: 'IdFilter' });

  await userEvent.type(input, `${ServiceInstance.c.id}{enter}`);

  const rowsAfter = await screen.findAllByRole('row', {
    name: 'InstanceRow-Intro',
  });

  expect(rowsAfter.length).toEqual(1);

  filterServer.close();
});
