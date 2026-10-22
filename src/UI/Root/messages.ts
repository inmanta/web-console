/**
 * The English messages of the shell: the app frame, the header, the sidebar, login and the pages of the shell.
 */
export const shellMessages = {
  /**
   * Error related text
   */
  "notFound.title": "404: We couldn't find that page",
  "notFound.home": "Go home",

  /**
   * Dashboard
   */
  "dashboard.logout": "Logout",
  "dashboard.documentation.tooltip": "Documentation",
  "dashboard.apiActions.tooltip": "Developer Tools",
  "dashboard.apiActions.graphiql": "GraphiQL",
  "dashboard.apiActions.restApi": "REST API / Swagger",
  "dashboard.status_page.tooltip": "Status page",
  "dashboard.notifications.tooltip": "Show notifications",

  /**
   * Environment controls
   */
  "environment.resume.button": "Resume",
  "environment.halt.button": "STOP",
  "environment.resume.tooltip": "Resume all halted operations in the current environment",
  "environment.halt.button.tooltip":
    "Emergency stop to halt all operations in the current environment",
  "environment.halt.title": "Halt environment",
  "environment.halt.details":
    "Are you sure you want to initiate an emergency stop and halt all operations in the current environment?",
  "environment.halt.label": "Operations halted",
  "environment.resume.title": "Resume environment",
  "environment.resume.details":
    "Are you sure you want to resume all operations in the current environment?",

  /** Compile details related text */
  "home.environmentSwitcher.search.placeholder": "Search by name or project",
  "home.environmentSwitcher.create.button": "Create new environment",
  "home.environmentSwitcher.manageProjects.button": "Manage projects",
  "home.environmentSwitcher.noEnvironments": "No environments available",
  "home.environmentSwitcher.signedInAs": "Signed in as: ",
  "home.manageProjects.title": "Manage projects",
  "home.manageProjects.description":
    "Projects group related environments. Deleting a project is permanent.",
  "home.manageProjects.callout.title": "Note",
  "home.manageProjects.callout": "A project can only be deleted once it has ",
  "home.manageProjects.callout.bold": "no environments",
  "home.manageProjects.callout.suffix": ". Delete its environments first to unlock the action.",
  "home.manageProjects.environments.count": (n: number) => `${n} environment${n === 1 ? "" : "s"}`,
  "home.manageProjects.environments.remain": (n: number) =>
    `${n} environment${n === 1 ? "" : "s"} remaining`,
  "home.manageProjects.environments.empty": "empty",
  "home.manageProjects.delete.confirm.button": "Confirm delete",
  "home.manageProjects.delete.cancel.button": "Cancel",
  "home.manageProjects.delete.confirm.warning": "This action cannot be undone.",
  "home.manageProjects.close.button": "Close",
  "home.noEnvironments.toast.title": "No environments available",
  "home.noEnvironments.toast.message": "You were redirected to create an environment.",
  "home.empty.message": "No environments found",
  "home.create.env.desciption": "Create new environment",
  "home.environment.selector": "Environments",
  "home.filters.project.placeholder": "Filter by project",
  "home.filters.env.placeholder": "Filter by name",

  /**
   * Navigation related text
   */
  "navigation.environment": "Environment",
  "navigation.lifecycleServiceManager": "Lifecycle Service Manager",
  "navigation.resourceManager": "Resource Manager",
  "navigation.orchestrationEngine": "Orchestration Engine",

  /**
   * Status
   */
  "status.title": "Orchestrator Status",
  "status.description":
    "The status of the orchestration server, loaded extensions and active components.",
  "status.supportArchive.action.download": "Download support archive",
  "status.supportArchive.action.download.error": "Failed to download support archive",
  "status.supportArchive.action.downloading": "Fetching support data",
  "status.supportArchive.action.downloading.error":
    "Something went wrong with downloading the support archive",

  /**
   * Notification
   */
  "notification.read": "Mark as read",
  "notification.unread": "Mark as unread",
  "notification.center.title": "Notification Center",
  "notification.center.empty": "No notifications found",
  "notification.severity.placeholder": "Severity...",
  "notification.read.placeholder": "Read...",
  "notification.message.placeholder": "Message...",
  "notification.title.placeholder": "Title...",
  "notification.drawer.showAll": "Show all notifications",
  "notification.drawer.readAll": "Mark all as read",
  "notification.drawer.clearAll": "Clear all",
  "notification.drawer.clear": "Clear",

  /**
   * Common
   */
  "common.environment.select": "Select an environment",

  /**
   * Login
   */
  "login.subtitle": "Enter your credentials",
  "login.login": "Log in",
};

type ShellMessages = typeof shellMessages;

declare module "@/Core/I18n/Words" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface WordsRegistry extends ShellMessages {}
}
