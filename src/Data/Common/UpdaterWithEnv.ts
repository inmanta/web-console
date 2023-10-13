import { Query } from "@/Core";

export class UpdaterWithEnv<Kind extends Query.Kind>
  implements UpdaterWithEnv<Kind>
{
  constructor(
    private readonly customUpdate: (
      query: Query.SubQuery<Kind>,
      environment: string,
    ) => Promise<void>,
  ) {}

  async update(
    query: Query.SubQuery<Kind>,
    environment: string,
  ): Promise<void> {
    return this.customUpdate(query, environment);
  }
}
