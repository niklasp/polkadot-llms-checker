export interface UrlCheck {
  id: string;
  name: string;
  url: string;
  status: "success" | "error";
  lastChecked: Date;
  responseTime?: number;
  errorMessage?: string;
}

export interface CheckResult {
  success: boolean;
  responseTime?: number;
  errorMessage?: string;
}
