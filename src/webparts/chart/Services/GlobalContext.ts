export class GlobalContextService {
    private static instance: GlobalContextService;
  
    // Define your global variables here
    private _siteUrl: string = '';
    private _userDisplayName: string = '';
    private _isAdmin: boolean = false;
  
    private constructor() {}
  
    public static getInstance(): GlobalContextService {
      if (!GlobalContextService.instance) {
        GlobalContextService.instance = new GlobalContextService();
      }
      return GlobalContextService.instance;
    }
  
    // Getters and setters for your global variables
    public get siteUrl(): string {
      return this._siteUrl;
    }
  
    public set siteUrl(value: string) {
      this._siteUrl = value;
    }
  
    public get userDisplayName(): string {
      return this._userDisplayName;
    }
  
    public set userDisplayName(value: string) {
      this._userDisplayName = value;
    }
  
    public get isAdmin(): boolean {
      return this._isAdmin;
    }
  
    public set isAdmin(value: boolean) {
      this._isAdmin = value;
    }
  }
  
  export const globalContext = GlobalContextService.getInstance();