export interface Branch {
  id: string;
  name: string;
  address: string;
  isActive: boolean;
}

export interface DeviceInfo {
  deviceId: string;
  userAgent: string;
  screenResolution: string;
  timestamp: number;
}

class BranchConfig {
  private static readonly BRANCH_KEY = 'TABLET_BRANCH_ID';
  private static readonly DEVICE_KEY = 'DEVICE_ID';
  private static readonly REGISTRATION_KEY = 'DEVICE_REGISTERED';
  private static readonly LOCK_KEY = 'BRANCH_LOCKED';

  static setBranch(branchId: string): void {
    localStorage.setItem(this.BRANCH_KEY, branchId);
    sessionStorage.setItem(this.BRANCH_KEY, branchId);
  }

  static getBranchId(): string | null {
    return localStorage.getItem(this.BRANCH_KEY) || 
           sessionStorage.getItem(this.BRANCH_KEY);
  }

  static isBranchConfigured(): boolean {
    return !!this.getBranchId();
  }

  static lockBranch(): void {
    localStorage.setItem(this.LOCK_KEY, 'true');
  }

  static isLocked(): boolean {
    return localStorage.getItem(this.LOCK_KEY) === 'true';
  }

  static clearBranchConfig(): void {
    console.log('Clearing branch configuration...');
    localStorage.removeItem(this.BRANCH_KEY);
    localStorage.removeItem(this.LOCK_KEY);
    localStorage.removeItem(this.REGISTRATION_KEY);
    sessionStorage.removeItem(this.BRANCH_KEY);
    console.log('Branch configuration cleared');
  }

  static getDeviceId(): string {
    let deviceId = localStorage.getItem(this.DEVICE_KEY);
    if (!deviceId) {
      deviceId = 'tablet_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem(this.DEVICE_KEY, deviceId);
    }
    return deviceId;
  }

  static isDeviceRegistered(): boolean {
    return localStorage.getItem(this.REGISTRATION_KEY) === 'true';
  }

  static setDeviceRegistered(): void {
    localStorage.setItem(this.REGISTRATION_KEY, 'true');
  }
}

class DeviceRegistration {
  static async registerDevice(branchId: string): Promise<void> {
    const deviceInfo = this.getDeviceInfo();
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/devices/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          deviceId: deviceInfo.deviceId,
          branchId,
          deviceInfo 
        })
      });
      
      if (!response.ok) {
        throw new Error('Device registration failed');
      }
      
      BranchConfig.setDeviceRegistered();
    } catch (error) {
      console.error('Device registration failed:', error);
      throw error;
    }
  }

  static getDeviceInfo(): DeviceInfo {
    return {
      deviceId: BranchConfig.getDeviceId(),
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      timestamp: Date.now()
    };
  }
}

class BranchValidator {
  static async validateBranch(branchId: string): Promise<boolean> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/branches-public/${branchId}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceInfo: DeviceRegistration.getDeviceInfo(),
          timestamp: Date.now()
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Branch validation failed:', error);
      return false;
    }
  }

  static async getBranches(): Promise<Branch[]> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/branches-public`);
      if (!response.ok) {
        throw new Error('Failed to fetch branches');
      }
      return response.json();
    } catch (error) {
      console.error('Failed to fetch branches:', error);
      throw error;
    }
  }
}

class BranchInitializer {
  static async initialize(): Promise<string> {
    // Debug logging
    console.log('BranchInitializer.initialize() called');
    
    // Always check if branch is properly configured
    const storedBranch = BranchConfig.getBranchId();
    console.log('Stored branch:', storedBranch);
    console.log('localStorage branch:', localStorage.getItem('TABLET_BRANCH_ID'));
    console.log('sessionStorage branch:', sessionStorage.getItem('TABLET_BRANCH_ID'));
    
    if (!storedBranch) {
      // No configuration found - require setup
      console.log('No branch configured, requiring manual setup');
      throw new Error('BRANCH_NOT_CONFIGURED');
    }
    
    // Validate the stored branch is still valid
    const isValid = await BranchValidator.validateBranch(storedBranch);
    console.log('Branch validation result:', isValid);
    
    if (!isValid) {
      console.log('Branch validation failed, clearing config and requiring setup');
      BranchConfig.clearBranchConfig();
      throw new Error('BRANCH_NOT_CONFIGURED');
    }
    
    console.log('Branch validation successful, using branch:', storedBranch);
    return storedBranch;
  }

  static getBranchFromURL(): string | null {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get('branch');
  }

  static async setBranchAndRegister(branchId: string): Promise<void> {
    console.log('Setting up branch:', branchId);
    
    // Validate branch exists
    const isValid = await BranchValidator.validateBranch(branchId);
    if (!isValid) {
      console.error('Branch validation failed for:', branchId);
      throw new Error('INVALID_BRANCH');
    }

    try {
      // Register device with backend
      await DeviceRegistration.registerDevice(branchId);
      console.log('Device registered successfully');
      
      // Store locally
      BranchConfig.setBranch(branchId);
      console.log('Branch stored in localStorage');
      
      // Lock configuration
      BranchConfig.lockBranch();
      console.log('Branch configuration locked');
      
      // Clean URL if needed
      this.cleanURL();
    } catch (error) {
      console.error('Error during branch setup:', error);
      throw error;
    }
  }

  // Manual branch setup method for tablet configuration
  static async setupBranchManually(branchId: string): Promise<void> {
    console.log('Manual branch setup initiated for:', branchId);
    
    // Clear any existing configuration first
    BranchConfig.clearBranchConfig();
    
    // Set up the new branch
    await this.setBranchAndRegister(branchId);
    
    console.log('Manual branch setup completed for:', branchId);
  }

  static cleanURL(): void {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.delete('branch');
    window.history.replaceState({}, '', url.toString());
  }

  static async adminUnlock(password: string): Promise<boolean> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/admin/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          password,
          deviceId: BranchConfig.getDeviceId()
        })
      });
      
      if (response.ok) {
        BranchConfig.clearBranchConfig();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Admin unlock failed:', error);
      return false;
    }
  }

  // Force reset for debugging - removes this in production
  static forceReset(): void {
    console.log('Force resetting branch configuration...');
    BranchConfig.clearBranchConfig();
    window.location.reload();
  }
}

export {
  BranchConfig,
  DeviceRegistration,
  BranchValidator,
  BranchInitializer
};
