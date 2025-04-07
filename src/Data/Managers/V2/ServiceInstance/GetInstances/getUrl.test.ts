import { PageSize } from '@/Core';
import { initialCurrentPage } from '@/Data/Common/UrlState/useUrlStateWithCurrentPage';
import { getUrl, UrlParams } from './getUrl';

test('getUrl returns correct url for no filter & no sort', () => {
  const name = 'service_a';
  const query: UrlParams = {
    name,
    filter: undefined,
    sort: undefined,
    pageSize: PageSize.initial,
    currentPage: initialCurrentPage,
  };

  expect(getUrl(query)).toMatch(
    `/lsm/v1/service_inventory/${name}?include_deployment_progress=True&limit=20`,
  );
});

test('getUrl returns correct url for filter & no sort', () => {
  const name = 'service_a';
  const query: UrlParams = {
    name,
    filter: {
      state: ['up', 'creating'],
    },
    sort: undefined,
    pageSize: PageSize.from('100'),
    currentPage: initialCurrentPage,
  };

  expect(getUrl(query)).toMatch(
    `/lsm/v1/service_inventory/${name}?include_deployment_progress=True&limit=100&filter.state=up&filter.state=creating`,
  );
});

test('getUrl returns correct url for sort & no filter', () => {
  const name = 'service_a';
  const query: UrlParams = {
    name,
    filter: undefined,
    sort: {
      name: 'state',
      order: 'asc',
    },
    pageSize: PageSize.initial,
    currentPage: initialCurrentPage,
  };

  expect(getUrl(query)).toMatch(
    `/lsm/v1/service_inventory/${name}?include_deployment_progress=True&limit=20&sort=state.asc`,
  );
});

test('getUrl returns correct url for sort & filter', () => {
  const name = 'service_a';
  const query: UrlParams = {
    name,
    filter: {
      state: ['up', 'creating'],
    },
    sort: {
      name: 'state',
      order: 'asc',
    },
    pageSize: PageSize.initial,
    currentPage: initialCurrentPage,
  };

  expect(getUrl(query)).toMatch(
    `/lsm/v1/service_inventory/${name}?include_deployment_progress=True&limit=20&filter.state=up&filter.state=creating&sort=state.asc`,
  );
});

test('getUrl returns correct url for empty filter', () => {
  const name = 'service_a';
  const query: UrlParams = {
    name,
    filter: {
      state: [],
      id_or_service_identity: [],
      attributeSetEmpty: [],
      attributeSetNotEmpty: [],
    },
    pageSize: PageSize.from('50'),
    currentPage: initialCurrentPage,
  };

  expect(getUrl(query)).toMatch(
    `/lsm/v1/service_inventory/${name}?include_deployment_progress=True&limit=50`,
  );
});

test('getUrl returns correct url for no filter & no sort', () => {
  const name = 'service_a';
  const startQuery = 'start=2023-12-13T08%3A33%3A15.180818%2B00%3A00';
  const query: UrlParams = {
    name,
    filter: undefined,
    sort: undefined,
    pageSize: PageSize.initial,
    currentPage: {
      kind: 'CurrentPage',
      value: startQuery,
    },
  };

  expect(getUrl(query)).toMatch(
    `/lsm/v1/service_inventory/${name}?include_deployment_progress=True&limit=20&${startQuery}`,
  );

  const endQuery = 'end=%3D2023-12-13T08%253A33%253A15.192674%252B00%253A00';

  expect(
    getUrl({
      ...query,
      currentPage: {
        kind: 'CurrentPage',
        value: endQuery,
      },
    }),
  ).toMatch(
    `/lsm/v1/service_inventory/${name}?include_deployment_progress=True&limit=20&${endQuery}`,
  );
});
