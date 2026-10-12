import { delay } from '@/services/mock/delay';
import { MOCK_VERIFICATION_STEPS } from '@/services/mock/data/security';
import { ApiError } from '@/services/types/common';
import type { VerificationAPI } from '@/services/types/verification';

const steps = MOCK_VERIFICATION_STEPS.map((s) => ({ ...s }));

export const verificationMockApi: VerificationAPI = {
  async listSteps() {
    await delay();
    return steps;
  },
  async submitStep(key, fields) {
    await delay(700);
    const step = steps.find((s) => s.key === key);
    if (!step) throw new ApiError('NOT_FOUND', 'Verification step not found.');
    step.status = 'in_review';
    step.fields = step.fields.map((f) => ({ ...f, value: fields[f.label] ?? f.value }));
    return step;
  },
};
