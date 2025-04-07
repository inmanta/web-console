import { QueryClient } from '@tanstack/react-query';

export const testClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});
