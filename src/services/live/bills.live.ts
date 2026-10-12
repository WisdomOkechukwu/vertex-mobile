import { http } from '@/services/live/http';
import type { BillsAPI } from '@/services/types/bills';

export const billsLiveApi: BillsAPI = {
  listBillTypes: () => http.get('/bills/types'),
  payBill: (payload) => http.post('/bills/pay', payload),
};
