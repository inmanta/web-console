import { words } from "@inmanta/web-console-core";
import { Agent, AgentRow } from "@inmanta/web-console-core/Domain/Agent";
import { ColumnHead, createTablePresenter } from "@inmanta/web-console-ui/Presenters";

/**
 * Table presenter for the Agents view. The "unpause on resume" column only shows
 * when the environment is halted.
 *
 * @example createAgentsTablePresenter(true).getColumnHeadDisplayNames().length // 3
 */
export const createAgentsTablePresenter = (isHalted: boolean) => {
  const columnHeads: ColumnHead[] = [
    { displayName: words("name"), apiName: "name" },
    { displayName: words("status"), apiName: "status" },
  ];

  if (isHalted) {
    columnHeads.push({
      displayName: words("agents.columns.unpause"),
      apiName: "unpause_on_resume",
    });
  }

  return createTablePresenter<Agent, AgentRow>({
    columnHeads,
    sortableColumns: ["name", "status"],
    createRows: (agents) => agents.map(({ environment: _environment, ...rest }) => rest),
  });
};

export type AgentsTablePresenter = ReturnType<typeof createAgentsTablePresenter>;
