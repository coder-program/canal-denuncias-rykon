// Re-export all services
export { authService } from './authService';
export { complaintsService } from './complaintsService';
export { usersService } from './usersService';
export { notificationsService } from './notificationsService';

// Re-export types
export type { LoginRequest, LoginResponse, RegisterRequest } from './authService';
export type {
  CreateComplaintRequest,
  UpdateComplaintRequest,
  QueryComplaintsParams,
  ComplaintsListResponse,
  ComplaintStatsResponse,
} from './complaintsService';
export type { CreateUserRequest, UpdateUserRequest, QueryUsersParams } from './usersService';
export type { Notification, UnreadCountResponse } from './notificationsService';
