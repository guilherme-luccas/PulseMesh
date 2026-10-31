export type PostAuthorRole = 'citizen' | 'admin';

export interface AlertPost {
  id: string;
  alertId: string;
  body: string;
  createdAt: string;
  authorRole: PostAuthorRole;
  authorId: string;
}
