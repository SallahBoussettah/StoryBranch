export interface User {
  id: string;
  username: string;
  email: string;
  role: 'READER' | 'WRITER' | 'ADMIN';
}