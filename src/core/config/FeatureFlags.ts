export interface IFeatureFlags {
  hostApprovalEnabled: boolean;
  visitorPhotoMandatory: boolean;
  governmentIdMandatory: boolean;
  qrVerificationEnabled: boolean;
  walkInRegistrationEnabled: boolean;
  notificationsEnabled: boolean;
}

/**
 * Feature Flags Configuration.
 * In a real application, these might be fetched remotely via LaunchDarkly, Firebase Remote Config, etc.
 */
class FeatureFlagService {
  private static instance: FeatureFlagService;
  private flags: IFeatureFlags;

  private constructor() {
    // Default Configuration
    this.flags = {
      hostApprovalEnabled: true,
      visitorPhotoMandatory: false,
      governmentIdMandatory: true,
      qrVerificationEnabled: true,
      walkInRegistrationEnabled: true,
      notificationsEnabled: true,
    };
  }

  public static getInstance(): FeatureFlagService {
    if (!FeatureFlagService.instance) {
      FeatureFlagService.instance = new FeatureFlagService();
    }
    return FeatureFlagService.instance;
  }

  public getFlag<K extends keyof IFeatureFlags>(flag: K): IFeatureFlags[K] {
    return this.flags[flag];
  }

  public updateFlags(newFlags: Partial<IFeatureFlags>) {
    this.flags = { ...this.flags, ...newFlags };
  }
}

export default FeatureFlagService.getInstance();
