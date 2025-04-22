import React, { createContext, useContext, useState, useCallback } from "react";

/**
 * State for the QueryControlContext.
 */
interface QueryControlState {
  queriesEnabled: boolean;
}

/**
 * Interface for the Context for controlling query execution.
 */
interface QueryControlContextType extends QueryControlState {
  enableQueries: () => void;
  disableQueries: () => void;
}

/**
 * Context for controlling query execution.
 */
const QueryControlContext = createContext<QueryControlContextType | undefined>(undefined);

/**
 * Provider for the QueryControlContext.
 *
 * @param {React.ReactNode} children - The children of the provider.
 * @returns {React.ReactNode} The provider.
 */
export const QueryControlProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<QueryControlState>({
    queriesEnabled: true,
  });

  /**
   * Enables query execution.
   */
  const enableQueries = useCallback(() => {
    setState((prev) => ({ ...prev, queriesEnabled: true }));
  }, []);

  /**
   * Disables query execution.
   */
  const disableQueries = useCallback(() => {
    setState((prev) => ({ ...prev, queriesEnabled: false }));
  }, []);

  const value = {
    ...state,
    enableQueries,
    disableQueries,
  };

  return <QueryControlContext.Provider value={value}>{children}</QueryControlContext.Provider>;
};

/**
 * Hook for using the QueryControlContext.
 *
 * @returns {QueryControlContextType} The context.
 */
export const useQueryControl = () => {
  const context = useContext(QueryControlContext);

  if (context === undefined) {
    throw new Error("useQueryControl must be used within a QueryControlProvider");
  }

  return context;
};
