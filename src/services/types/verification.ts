export interface VerificationStep {
  key: 'email' | 'identity' | 'address';
  label: string;
  desc: string;
  status: 'pending' | 'in_review' | 'done';
  fields: { label: string; value: string; ph: string }[];
}

export interface VerificationAPI {
  listSteps(): Promise<VerificationStep[]>;
  submitStep(key: string, fields: Record<string, string>): Promise<VerificationStep>;
}
