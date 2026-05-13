export interface User {
  uid: string;
  email: string;
  displayName: string;
  currency: string;
  createdAt: Date;
}

export interface Income {
  id?: string;
  userId?: string;
  amount: number;
  source: string;
  date: Date;
  category: string;
  remarks?: string;
}

export interface BazarItem {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  remarks?: string;
}

export interface BazarLog {
  id?: string;
  userId?: string;
  date: Date;
  totalAmount: number;
  items: BazarItem[];
  remarks?: string;
}

export interface Bill {
  id?: string;
  userId?: string;
  category: string;
  amount: number;
  month: number; // 0-11
  year: number;
  isPaid: boolean;
  paidAt?: Date;
  remarks?: string;
}

export interface EducationExpense {
  id?: string;
  userId?: string;
  amount: number;
  subCategory: string;
  description: string;
  date: Date;
  remarks?: string;
}

export interface Loan {
  id?: string;
  userId?: string;
  personName: string;
  type: 'taken' | 'given';
  amount: number;
  remainingBalance: number;
  status: 'active' | 'cleared';
  date: Date;
  description: string;
  remarks?: string;
}

export interface LoanTransaction {
  id?: string;
  userId?: string;
  loanId: string;
  amount: number;
  date: Date;
  type: 'repayment' | 'addition';
  remarks?: string;
}
