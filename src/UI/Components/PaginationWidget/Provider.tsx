import React from "react";
import styled from "styled-components";
import { PageSize, Pagination, RemoteData } from "@/Core";
import { View } from "./View";

type Data = RemoteData.Type<
  string,
  { handlers: Pagination.Handlers; metadata: Pagination.Metadata }
>;

interface Props {
  data: Data;
  pageSize: PageSize.Type;
  setPageSize: (size: PageSize.Type) => void;
}

export const Provider: React.FC<Props> = ({ data, pageSize, setPageSize }) =>
  RemoteData.fold(
    {
      notAsked: () => <Filler />,
      loading: () => <Filler />,
      failed: () => <Filler />,
      success: ({ handlers, metadata }) => (
        <View
          handlers={handlers}
          metadata={metadata}
          pageSize={pageSize}
          setPageSize={setPageSize}
          aria-label="PaginationWidget"
        />
      ),
    },
    data,
  );

const Filler = styled.div`
  height: 36px;
  width: 264px;
`;
