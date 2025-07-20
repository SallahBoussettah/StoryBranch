export interface User {
  id: string;
  username: string;
  email: string;
  role: 'reader' | 'writer' | 'admin';
}