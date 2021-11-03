export default {
  "home.title": "Home",
  "home.navigation.tooltip": "Go to the overview page",
  "home.navigation.button": "Overview",
  "home.empty.message": "No environments found",
  "home.create.env.desciption": "Create new environment",
  "home.create.env.link": "Create environment",
  "home.environment.select": "Select this environment",
  "home.environment.edit": "Edit environment",
  "home.environment.delete": "Delete environment",
  "home.environment.delete.warning": "Are you absolutely sure?",
  "home.environment.delete.warning.description.MD": (environment: string) =>
    `This action cannot be undone. This will permanently delete the **${environment}** environment.`,
  "home.environment.delete.warning.instruction.MD": (environment: string) =>
    `Please type **${environment}** to confirm`,
  "home.environment.delete.warning.action":
    "I understand the consequences, delete this environment",
  "home.filters.project.placeholder": "Filter by project",
  "home.filters.env.placeholder": "Filter by name",
  "home.environment.copy": "Copy id",
};
