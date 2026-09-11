export interface UserProfile {
  phoneNumber: string;
  fullName: string;
  idNumber: string;
  email: string;
  creditScore: number;
  maxLimit: number;
  isLoggedIn: boolean;
}

export interface LoanApplication {
  amount: number;
  durationDays: number;
  interestRate: number; // e.g. 0.15 (15%)
  serviceFee: number; // e.g. KSh 150
  interestAmount: number;
  totalRepayable: number;
  repaymentDate: string;
  status: 'idle' | 'submitting' | 'checking_credit' | 'analyzing' | 'approved' | 'disbursing' | 'disbursed' | 'rejected';
}

export interface ActiveLoan {
  id: string;
  amount: number;
  interest: number;
  serviceFee: number;
  totalPayable: number;
  repaymentDate: string;
  daysRemaining: number;
  status: 'active' | 'overdue' | 'repaying' | 'repaid';
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'disbursement' | 'repayment';
  status: 'success' | 'pending' | 'failed';
  reference: string;
}
