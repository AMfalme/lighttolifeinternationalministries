export type UserRole = 'admin' | 'team-member' | 'user';

export interface userDetails {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  branchLocation?: string; // e.g., "Main Branch", "North Location", "South Location"
  role?: UserRole; // admin or team-member
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserAuthState {
  user: userDetails | null;
  loading: boolean;
  error: string | null;
}
