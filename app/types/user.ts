export type UserRole = 'admin' | 'leadership' | 'user';

export interface userDetails {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  branchLocation?: string; // e.g., "Mosocho (Main church headquarters)", "Nyanchwa", "Omogwa"
  branchMapUrl?: string;
  role?: UserRole; // admin or leadership
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserAuthState {
  user: userDetails | null;
  loading: boolean;
  error: string | null;
}
