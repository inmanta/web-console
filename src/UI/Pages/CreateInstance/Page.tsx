import React, { useContext } from "react";
import { PageContainer, RemoteDataView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";
import { CreateInstance } from "./CreateInstance";

export const Page: React.FC = () => {
  const { service: serviceName } = useRouteParams<"CreateInstance">();
  const { queryResolver } = useContext(DependencyContext);

  const [data, retry] = queryResolver.useContinuous<"GetService">({
    kind: "GetService",
    name: serviceName,
  });

  return (
    <PageContainer title={words("inventory.createInstance.title")}>
      <RemoteDataView
        data={data}
        retry={retry}
        label="AddInstance"
        SuccessView={(service) => (
          <div aria-label="AddInstance-Success">
            <CreateInstance serviceEntity={service} />
          </div>
        )}
      />
    </PageContainer>
  );
};
