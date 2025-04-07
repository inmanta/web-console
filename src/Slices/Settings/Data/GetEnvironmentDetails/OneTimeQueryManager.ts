import { identity } from 'lodash-es';
import { ApiHelper } from '@/Core';
import { QueryManager } from '@/Data/Managers/Helpers';
import { Store } from '@/Data/Store';
import { StateHelper } from './StateHelper';
import { getUrl } from './getUrl';

export function EnvironmentDetailsOneTimeQueryManager (
  store: Store,
  apiHelper: ApiHelper,
) {
  return QueryManager.OneTime<'GetEnvironmentDetails'>(
    apiHelper,
    StateHelper(store),
    ({ id }) => [id],
    'GetEnvironmentDetails',
    ({ details, id }) => getUrl(details, id),
    identity,
    'MERGE',
  );
}
