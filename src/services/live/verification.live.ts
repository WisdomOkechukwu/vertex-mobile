import { http } from '@/services/live/http';
import type { VerificationAPI } from '@/services/types/verification';

export const verificationLiveApi: VerificationAPI = {
  listSteps: () => http.get('/verification/steps'),
  submitStep: (key: string, fields: Record<string, string>) =>
    http.post(`/verification/steps/${key}`, { fields }),
};
