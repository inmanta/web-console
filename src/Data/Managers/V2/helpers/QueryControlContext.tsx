import React, { createContext, useContext, useState, useCallback } from "react";

interface QueryControlState {
  queriesEnabled: boolean;
}

interface QueryControlContextType extends QueryControlState {
  enableQueries: () => void;
  disableQueries: () => void;
}

const QueryControlContext = createContext<QueryControlContextType | undefined>(
  undefined,
);

export const QueryControlProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<QueryControlState>({
    queriesEnabled: true,
  });

  const enableQueries = useCallback(() => {
    setState((prev) => ({ ...prev, queriesEnabled: true }));
  }, []);

  const disableQueries = useCallback(() => {
    setState((prev) => ({ ...prev, queriesEnabled: false }));
  }, []);

  const value = {
    ...state,
    enableQueries,
    disableQueries,
  };

  return (
    <QueryControlContext.Provider value={value}>
      {children}
    </QueryControlContext.Provider>
  );
};

export const useQueryControl = () => {
  const context = useContext(QueryControlContext);

  if (context === undefined) {
    throw new Error(
      "useQueryControl must be used within a QueryControlProvider",
    );
  }

  return context;
};
