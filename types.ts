export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  fileName: string;
  provider: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  taxAmount: number;
  currency: string;
  items: InvoiceItem[];
}

export type Language = 'en' | 'es';
export type UserRole = 'admin' | 'viewer';

export interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
}
