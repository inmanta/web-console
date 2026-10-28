/**
 * The English messages of the environment feature: the home page, the dashboard and the settings.
 */
export const environmentMessages = {
  /**
   * General text
   */
  submit: "Submit",
  save: "Save",
  reset: "Reset",

  /**
   * Dashboard
   */
  "dashboard.title": "Environment Health",
  "dashboard.environmentHealth.subtitle":
    "Live status across orchestration, resources, compiles and services",
  "dashboard.environmentHealth.switch": "Switch",
  "dashboard.environmentHealth.orchestratorLabel": "ORCHESTRATOR",
  "dashboard.environmentHealth.operational": "Operational",
  "dashboard.environmentHealth.status.healthy": "Healthy",
  "dashboard.environmentHealth.status.attention": "Attention",
  "dashboard.environmentHealth.status.danger": "Danger",
  "dashboard.environmentHealth.viewDetails": (title: string) => `View ${title} details`,
  "dashboard.environmentHealth.checklist.serverOk": "Server OK",
  "dashboard.environmentHealth.checklist.databaseConnected": "Database connected",
  "dashboard.environmentHealth.checklist.schedulerRunning": "Scheduler running",
  "dashboard.environmentHealth.services": "Services",
  "dashboard.environmentHealth.compiles": "Compiles",
  "dashboard.environmentHealth.agents": "Agents",
  "dashboard.environmentHealth.servicesSummary": (
    total: number,
    healthy: number,
    warning: number,
    danger: number
  ): string[] => [
    `${total} instances`,
    `${healthy} healthy`,
    `${warning} warning`,
    `${danger} danger`,
  ],
  "dashboard.environmentHealth.resourcesSummary": (
    total: number,
    failedCount: number,
    nonCompliantCount: number
  ): string[] => [
    `${total} resources`,
    `${failedCount} failed to deploy`,
    `${nonCompliantCount} non-compliant`,
  ],
  "dashboard.environmentHealth.agentsSummary": (
    total: number,
    up: number,
    down: number,
    paused: number
  ): string[] => [`${total} agents`, `${up} up`, `${down} down`, `${paused} paused`],
  "dashboard.environmentHealth.compiles.latestSucceeded": "Latest compile succeeded",
  "dashboard.environmentHealth.compiles.latestFailed": "Latest compile failed",
  "dashboard.environmentHealth.compiles.latestRunning": "Latest compile running",
  "dashboard.environmentHealth.compiles.none": "No compiles yet",
  "dashboard.compileReports.title": "Latest compile reports",
  "dashboard.compileReports.viewAll": "View all compile reports",
  "dashboard.compileReports.empty": "No compile reports yet",
  "dashboard.compileReports.running": "Running…",
  "dashboard.compileReports.queued": "Queued",
  "dashboard.compileReports.startedAgo": "started",
  "dashboard.compileReports.viewProgress": "View progress",
  "dashboard.compileReports.viewReport": "View report",
  "dashboard.orchestrator.title": "Orchestrator",
  "dashboard.orchestrator.edition": "Edition",
  "dashboard.orchestrator.license": "License",
  "dashboard.orchestrator.pythonVersion": "Python",
  "dashboard.orchestrator.postgresqlVersion": "PostgreSQL",
  "dashboard.orchestrator.licenseSummary": (isValid: boolean, expiry: string): string =>
    `${isValid ? "Valid" : "Expired"} · exp ${expiry}`,
  "dashboard.orchestrator.extensionsLabel": "EXTENSIONS",
  "dashboard.orchestrator.extensionTag": "extension",
  "dashboard.orchestrator.viewFullStatus": "Open full Orchestrator Status page",
  "dashboard.resourceManager.title": "Resource Manager",
  "dashboard.resourceManager.subtitle": "Deployment state",
  "dashboard.resourceManager.compliance.title": "Compliance",
  "dashboard.resourceManager.deployResult.title": "Deploy result",
  "dashboard.resourceManager.blocked.title": "Blocked",
  "dashboard.resourceManager.summary": "Summary",
  "dashboard.resourceManager.summaryCount": (count: number) =>
    `${count.toLocaleString()} resources`,
  "dashboard.resourceManager.deployingNow": "Deploying now",
  "dashboard.resourceManager.deployedOk": "Deployed OK",
  "dashboard.resourceManager.failed": "Failed",
  "dashboard.resourceManager.nonCompliant": "Non-compliant",
  "dashboard.orchestrationEngine.title": "Orchestration Engine",
  "dashboard.orchestrationEngine.subtitle": (days: number): string =>
    `Compile activity · last ${days} days`,
  "dashboard.orchestrationEngine.tabs.rate": "Compile rate",
  "dashboard.orchestrationEngine.tabs.time": "Compile time",
  "dashboard.orchestrationEngine.tabs.waiting": "Waiting time",
  "dashboard.orchestrationEngine.stats.compiles": "Compiles",
  "dashboard.orchestrationEngine.stats.failed": "Failed",
  "dashboard.orchestrationEngine.stats.avgCompile": "Avg compile",
  "dashboard.orchestrationEngine.stats.avgWaiting": "Avg waiting",
  "dashboard.orchestrationEngine.chart.rate.title": "Compiles per day",
  "dashboard.orchestrationEngine.chart.time.title": "Avg compile time (s)",
  "dashboard.orchestrationEngine.chart.waiting.title": "Avg waiting time (s)",
  "dashboard.orchestrationEngine.chart.xStart": (days: number): string => `${days} days ago`,
  "dashboard.orchestrationEngine.chart.xEnd": "Today",
  "dashboard.orchestrationEngine.range.last7Days": "Last 7 days",
  "dashboard.orchestrationEngine.range.last14Days": "Last 14 days",
  "dashboard.orchestrationEngine.range.last30Days": "Last 30 days",
  "dashboard.orchestrationEngine.refresh": "Refresh",

  /**
   * Environment controls
   */
  "environment.protected.tooltip":
    "This action is not allowed because the environment is protected",

  /** Compile details related text */
  "home.create.env": "Create environment",
  "home.environment.icon": (name: string) => `Icon for environment ${name}`,
  "home.environment.select": "Select this environment",
  "home.environment.edit": "Edit environment",
  "home.environment.delete": "Delete environment",
  "home.environment.clear": "Clear environment",
  "home.environment.delete.warning": "Are you absolutely sure?",
  "home.environment.delete.confirmation": (environment: string) => (
    <>
      This action cannot be undone. This will permanently delete the <b>{environment}</b>{" "}
      environment.
    </>
  ),
  "home.environment.clear.confirmation": (environment: string) => (
    <>
      This action cannot be undone. This will permanently remove everything from the{" "}
      <b>{environment}</b> environment and reset it to its initial state.
      <br />
      Only the <b>configuration options</b> will be preserved in their current state.
    </>
  ),
  "home.environment.promptInput": (environment: string) => (
    <>
      Please type <b>{environment}</b> to confirm
    </>
  ),
  "home.environment.delete.warning.action":
    "I understand the consequences, delete this environment",
  "home.environment.clear.warning.action": "I understand the consequences, clear this environment",
  "home.environment.copy": "Copy id",
  "createEnv.projectName": "Project Name",
  "createEnv.repository": "Repository",
  "createEnv.repository.tooltip":
    "The URL of the repository, for example: https://code.inmanta.com/my_project.git",
  "createEnv.branch": "Branch",
  "createEnv.branch.tooltip": "The branch of the repository, for example: main",
  "createEnv.icon": "Icon",

  /**
   * Settings
   */
  "settings.title": "Settings",
  "settings.tabs.environment": "Environment",
  "settings.tabs.environment.repoSettings": "Repository Settings",
  "settings.tabs.environment.projectName": "Project Name",
  "settings.tabs.environment.icon": "Icon",
  "settings.tabs.configuration": "Configuration",
  "settings.tabs.tokens": "Tokens",
  "settings.tabs.token.disabledInfo": "An authenticated user is required to create tokens",
  "settings.tabs.token.title": "Configure New Token",
  "settings.tabs.token.description":
    "Generate an authentication token for this environment. By default, generated tokens will provide API access.",
  "settings.tabs.token.description.details":
    "Most tokens only need API access. The agent and compiler types are only required for connecting an externally hosted agent or a remote compiler to this environment.",
  "settings.tabs.token.generate": "Generate",
  "settings.tabs.token.expiry": "Expires after",
  "settings.tabs.token.expiry.never": "Never",
  "settings.tabs.token.expiry.custom": "Custom",
  "settings.tabs.token.advanced": "Advanced options",
  "settings.tabs.token.clientTypes": "Client types",
  "settings.tabs.token.clientTypes.api": "API",
  "settings.tabs.token.clientTypes.agent": "Agent",
  "settings.tabs.token.clientTypes.compiler": "Compiler",
  "settings.tabs.token.registered.title": "Registered tokens",
  "settings.tabs.token.empty": "No revocable tokens have been created for this environment.",
  "settings.tabs.token.column.createdBy": "Created by",
  "settings.tabs.token.column.clientTypes": "Client types",
  "settings.tabs.token.column.issuedAt": "Issued",
  "settings.tabs.token.column.expiresAt": "Expires at",
  "settings.tabs.token.column.lastUsed": "Last used",
  "settings.tabs.token.column.revokedAt": "Revoked at",
  "settings.tabs.token.status.active": "Active",
  "settings.tabs.token.status.revoked": "Revoked",
  "settings.tabs.token.revoke": "Revoke",
  "settings.tabs.token.revoke.title": "Revoke token",
  "settings.tabs.token.revoke.confirm": (jti: string) =>
    `Are you sure you want to revoke token ${jti}? This action cannot be undone.`,
  "settings.update": "Setting Changed",
  "settings.warning.update": "Changed value has not been saved",
  "settings.protected.message": (protected_by: string) =>
    `This setting is protected by ${protected_by}, and cannot be changed.`,
  "settings.protected.message.default": "This setting is protected, and cannot be changed.",
};

type EnvironmentMessages = typeof environmentMessages;

declare module "@inmanta/web-console-core/I18n/Words" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface WordsRegistry extends EnvironmentMessages {}
}
