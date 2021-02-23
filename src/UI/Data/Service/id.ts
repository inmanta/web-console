import { Query } from "@/Core";

export const getId = ({ qualifier }: Query.SubQuery<"Service">): string =>
  `${qualifier.environment}__?__${qualifier.name}`;
