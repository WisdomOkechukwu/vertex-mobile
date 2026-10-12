import { http } from '@/services/live/http';
import type { LinkDraft, LinksAPI } from '@/services/types/links';

export const linksLiveApi: LinksAPI = {
  listLinks: () => http.get('/links'),
  createLink: (payload) => http.post('/links', payload),
  updateLink: (id: string, payload: LinkDraft) => http.patch(`/links/${id}`, payload),
  toggleActive: (id: string) => http.patch(`/links/${id}/toggle-active`),
  deleteLink: (id: string) => http.delete(`/links/${id}`),
};
