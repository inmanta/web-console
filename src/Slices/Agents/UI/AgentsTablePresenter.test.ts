import { Agent } from "@S/Agents/Core/Domain";
import { response } from "@S/Agents/Core/Mock";
import { createAgentsTablePresenter } from "./AgentsTablePresenter";

const agents = response.data as unknown as Agent[];

test("createRows drops the environment field from each agent", () => {
  const rows = createAgentsTablePresenter(true).createRows(agents);

  expect(rows).toHaveLength(agents.length);
  expect(rows.every((row) => !("environment" in row))).toBe(true);
});

test("the unpause-on-resume column only shows when the environment is halted", () => {
  const halted = createAgentsTablePresenter(true).getColumnHeads();
  const running = createAgentsTablePresenter(false).getColumnHeads();

  expect(halted).toHaveLength(running.length + 1);
});
