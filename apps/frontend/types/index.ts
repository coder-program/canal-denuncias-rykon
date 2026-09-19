// Types para o sistema
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'INVESTIGATOR' | 'REPORTER' | 'VIEWER';
  active: boolean;
  createdAt: string;
}

export interface Complaint {
  id: string;
  protocol: string;
  title: string;
  description: string;
  type: 'HARASSMENT' | 'CORRUPTION' | 'FRAUD' | 'DISCRIMINATION' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'UNDER_INVESTIGATION' | 'RESOLVED' | 'CLOSED';
  isAnonymous: boolean;
  reporterName?: string;
  reporterEmail?: string;
  reporterPhone?: string;
  assignedTo?: User;
  attachments: Attachment[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
}

export interface DashboardMetrics {
  totalComplaints: number;
  pendingComplaints: number;
  underInvestigation: number;
  resolvedComplaints: number;
  averageResolutionTime: number;
  complaintsByType: {
    type: string;
    count: number;
  }[];
  complaintsByPriority: {
    priority: string;
    count: number;
  }[];
  complaintsByMonth: {
    month: string;
    count: number;
  }[];
}

export interface SystemSettings {
  companyName: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  emailNotifications: boolean;
  systemAlerts: boolean;
  allowAnonymousReports: boolean;
  maintenanceMode: boolean;
  privacyPolicy?: string;
  termsOfService?: string;
}
