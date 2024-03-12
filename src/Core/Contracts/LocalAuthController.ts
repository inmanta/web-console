export interface LocalAuthController {
  getInstance();
  isEnabled(): boolean;
  getInitConfig();
}
