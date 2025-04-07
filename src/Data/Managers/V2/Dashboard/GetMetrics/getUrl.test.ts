import { getUrl } from './getUrl';

describe('buildUrl', () => {
  const params = {
    startDate: '2023-01-01',
    endDate: '2023-01-31',
    isLsmAvailable: false,
  };

  it('should build URL without LSM metrics when LSM is not available', () => {
    const url = getUrl(params);

    expect(url).toContain('metrics=orchestrator.compile_time');
    expect(url).toContain('metrics=orchestrator.compile_waiting_time');
    expect(url).toContain('metrics=orchestrator.compile_rate');
    expect(url).toContain('metrics=resource.agent_count');
    expect(url).toContain('metrics=resource.resource_count');
    expect(url).toContain(`start_interval=${params.startDate}`);
    expect(url).toContain(`end_interval=${params.endDate}`);
    expect(url).toContain('nb_datapoints=15');
    expect(url).toContain('round_timestamps=true');
    expect(url).not.toContain('metrics=lsm.service_count');
    expect(url).not.toContain('metrics=lsm.service_instance_count');
  });

  it('should include LSM metrics when LSM is available', () => {
    const paramsWithLsm = {
      ...params,
      isLsmAvailable: true,
    };

    const url = getUrl(paramsWithLsm);

    expect(url).toContain('metrics=lsm.service_count');
    expect(url).toContain('metrics=lsm.service_instance_count');
    expect(url).toContain('metrics=orchestrator.compile_time');
    expect(url).toContain(`start_interval=${params.startDate}`);
    expect(url).toContain(`end_interval=${params.endDate}`);
  });
});
