import React, { act } from 'react';
import { render, screen } from '@testing-library/react';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { words } from '@/UI';
import { MetricName } from '../Core/Domain';
import { mockedMetrics } from '../Core/Mock';
import { GraphCard } from './GraphCard';

expect.extend(toHaveNoViolations);

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

describe('Test GraphCard with LineChart component', () => {
  it('Line Chart version', async () => {
    const availableKeys = Object.keys(mockedMetrics.metrics);

    render(
      <GraphCard
        isStacked={false}
        timestamps={mockedMetrics.timestamps}
        metrics={{
          name: availableKeys[1],
          data: mockedMetrics.metrics[availableKeys[1]],
        }}
      />,
    );

    expect(
      await screen.findByRole('heading', {
        name: words(`dashboard.${availableKeys[1] as MetricName}.title`),
      }),
    ).toBeVisible();

    expect(
      screen.getByRole('img', {
        name: /service counter/i,
      }),
    ).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  it('Area Chart version', async () => {
    const availableKeys = Object.keys(mockedMetrics.metrics);

    render(
      <GraphCard
        isStacked={true}
        timestamps={mockedMetrics.timestamps}
        metrics={{
          name: availableKeys[6],
          data: mockedMetrics.metrics[availableKeys[6]],
        }}
      />,
    );

    expect(
      await screen.findByRole('heading', {
        name: words(`dashboard.${availableKeys[6] as MetricName}.title`),
      }),
    ).toBeVisible();

    expect(
      screen.getByRole('img', {
        name: /agents count/i,
      }),
    ).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });
});
