export interface AuthHelper {
  getUsername(): string | null;
  isDisabled(): boolean;
}
