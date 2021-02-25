import { Query } from "@/Core";

export const getKey = ({
  environment,
  name,
}: Query.Qualifier<"Service">): string => `${environment}__?__${name}`;
