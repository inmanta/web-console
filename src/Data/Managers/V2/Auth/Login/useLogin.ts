import { useMutation } from '@tanstack/react-query';
import { usePostWithoutEnv } from '../../helpers';

interface LoginResponse {
  data: {
    token: string;
    user: {
      username: string;
      auth_method: string;
    };
  };
}

interface LoginBody {
  username: string;
  password: string;
}

/**
 * Custom hook for performing user login mutation for database authentication - for keycloak head to keycloak.js library.
 * This hook utilizes React Query's useMutation to handle asynchronous mutations.
 * @returns A tuple containing the mutation function and mutation state.
 */
export const useLogin = () => {
  const post = usePostWithoutEnv()<LoginBody>;

  return useMutation<LoginResponse, Error, LoginBody>({
    mutationFn: (body) => post('/api/v2/login', body),
    mutationKey: ['login'],
  });
};
