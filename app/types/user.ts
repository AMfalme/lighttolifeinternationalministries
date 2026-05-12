export interface userDetails {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserAuthState {
  user: userDetails | null;
  loading: boolean;
  error: string | null;
}
