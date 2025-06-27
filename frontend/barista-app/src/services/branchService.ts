export interface Branch {
  id: string;
  name: string;
  address: string;
  isActive?: boolean; // Optional since API doesn't always return this field
}

export interface DeviceInfo {
  deviceId: string;
  userAgent: string;
  screenResolution: string;
  timestamp: number;
}

class BranchConfig {
  private static readonly BRANCH_KEY = 'BARISTA_BRANCH_ID';
  private static readonly DEVICE_KEY = 'BARISTA_DEVICE_ID';
  private static readonly REGISTRATION_KEY = 'BARISTA_DEVICE_REGISTERED';
  private static readonly LOCK_KEY = 'BARISTA_BRANCH_LOCKED';

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
    localStorage.removeItem(this.BRANCH_KEY);
    localStorage.removeItem(this.LOCK_KEY);
    localStorage.removeItem(this.REGISTRATION_KEY);
    sessionStorage.removeItem(this.BRANCH_KEY);
  }

  static getDeviceId(): string {
    let deviceId = localStorage.getItem(this.DEVICE_KEY);
    if (!deviceId) {
      deviceId = 'barista_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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
          deviceInfo,
          deviceType: 'BARISTA_APP'
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
    // 1. Check URL first (for initial setup)
    const urlBranch = this.getBranchFromURL();
    
    // 2. Check stored configuration
    const storedBranch = BranchConfig.getBranchId();
    
    if (urlBranch && urlBranch !== storedBranch) {
      // URL takes precedence - allows remote reconfiguration
      await this.setBranchAndRegister(urlBranch);
    } else if (!storedBranch) {
      // No configuration found - require setup
      throw new Error('BRANCH_NOT_CONFIGURED');
    }
    
    const branchId = BranchConfig.getBranchId();
    if (!branchId) {
      throw new Error('BRANCH_NOT_CONFIGURED');
    }
    
    return branchId;
  }

  static getBranchFromURL(): string | null {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get('branch');
  }

  static async setBranchAndRegister(branchId: string): Promise<void> {
    // Validate branch exists
    const isValid = await BranchValidator.validateBranch(branchId);
    if (!isValid) {
      throw new Error('INVALID_BRANCH');
    }

    // Register device with backend
    await DeviceRegistration.registerDevice(branchId);
    
    // Store locally
    BranchConfig.setBranch(branchId);
    
    // Lock configuration
    BranchConfig.lockBranch();
    
    // Clean URL
    this.cleanURL();
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
}

export {
  BranchConfig,
  DeviceRegistration,
  BranchValidator,
  BranchInitializer
};
