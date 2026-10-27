/**
 * The English messages of the user management page.
 */
export const userManagementMessages = {
  /**
   * General text
   */
  success: "Success",
  "success.title": "Success",

  /**
   * User Management
   */
  "userManagement.changePassword": "Change Password",
  "userManagement.changePassword.placeholder": "New Password...",
  "userManagement.changePassword.currentPassword": "Current Password",
  "userManagement.changePassword.currentPassword.placeholder": "Current Password...",
  "userManagement.changePassword.success": "Password changed successfully",
  "userManagement.changePassword.message": (username: string) =>
    `Please provide a new password for user ${username}`,
  "userManagement.addUser": "Add User",
  "userManagement.deleteUser.title": "Delete User",
  "userManagement.deleteUserMessage": (username: string) =>
    `Are you sure you want to delete user ${username}?`,
  "userManagement.empty.message": "No users found",
  "userManagement.roles": "Roles",
  "userManagement.roles.none": "None",
  "userManagement.roles.unavailable": "No roles available",
  "userManagement.roles.edit": "Edit roles",
  "userManagement.environment": "Environment",
  "userManagement.role": "Role",
};

type UserManagementMessages = typeof userManagementMessages;

declare module "@/Core/I18n/Words" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface WordsRegistry extends UserManagementMessages {}
}
