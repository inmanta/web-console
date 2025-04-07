import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { ServiceModel } from '@/Core';
import { CustomError, useGet } from '../../helpers';

/**
 * Return Signature of the useGetServiceModel React Query
 */
interface GetServiceModels {
  useOneTime: () => UseQueryResult<ServiceModel[], CustomError>;
  useContinuous: () => UseQueryResult<ServiceModel[], CustomError>;
}

/**
 * React Query hook to fetch the service models
 *
 * @param environment {string} - the environment in which the services belongs
 *
 * @returns {GetServiceModels} An object containing the different available queries.
 * @returns {UseQueryResult<ServiceModel[], CustomError>} returns.useOneTime - Fetch the service models with a single query.
 * @returns {UseQueryResult<ServiceModel[], CustomError>} returns.useContinuous - Fetch the service models with an interval of 5s.
 */
export const useGetServiceModels = (): GetServiceModels => {
  const get = useGet()<{ data: ServiceModel[] }>;

  return {
    useOneTime: (): UseQueryResult<ServiceModel[], CustomError> =>
      useQuery({
        queryKey: ['get_service_models-one_time'],
        queryFn: () => get('/lsm/v1/service_catalog?instance_summary=True'),
        select: (data) => data.data,
      }),
    useContinuous: (): UseQueryResult<ServiceModel[], CustomError> =>
      useQuery({
        queryKey: ['get_service_models-continuous'],
        queryFn: () => get('/lsm/v1/service_catalog?instance_summary=True'),
        refetchInterval: 5000,
        select: (data) => data.data,
      }),
  };
};
