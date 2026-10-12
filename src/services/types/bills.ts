export interface BillType {
  key: string;
  title: string;
  field: string;
  hint: string;
  providers: string[];
  ref: string;
  icon: string;
}

export interface BillsAPI {
  listBillTypes(): Promise<BillType[]>;
  payBill(payload: {
    billKey: string;
    provider: string;
    reference: string;
    amount: number;
    fromWalletCode: string;
  }): Promise<import('./transactions').Transaction>;
}
