import { EnvironmentDetails } from "@/Core";

export const a: EnvironmentDetails = {
  id: "c85c0a64-ed45-4cba-bdc5-703f65a225f7",
  name: "dev",
  project_id: "62ee61ef-d830-4f44-af41-a3eeba50ca4a",
  repo_url: "",
  repo_branch: "",
  settings: {
    auto_deploy: false,
    autostart_agent_map: { internal: "local:" },
    push_on_auto_deploy: false,
    resource_action_logs_retention: 7,
    agent_trigger_method_on_auto_deploy: "push_full_deploy",
    server_compile: true,
  },
  halted: false,
};

export const halted: EnvironmentDetails = { ...a, halted: true };
