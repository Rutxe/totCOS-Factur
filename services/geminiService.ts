import { GoogleGenAI, Type } from "@google/genai";
import type { Invoice } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a placeholder check. In a real environment, this should be handled gracefully.
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const invoiceSchema = {
  type: Type.OBJECT,
  properties: {
    provider: { type: Type.STRING, description: 'The name of the company or person issuing the invoice.' },
    invoiceDate: { type: Type.STRING, description: 'The date the invoice was issued, in YYYY-MM-DD format.' },
    dueDate: { type: Type.STRING, description: 'The date the payment is due, in YYYY-MM-DD format.' },
    totalAmount: { type: Type.NUMBER, description: 'The total amount due, including taxes.' },
    taxAmount: { type: Type.NUMBER, description: 'The total amount of tax.' },
    currency: { type: Type.STRING, description: 'The currency of the amounts (e.g., USD, EUR).' },
    items: {
      type: Type.ARRAY,
      description: 'A list of items or services on the invoice.',
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          quantity: { type: Type.NUMBER },
          unitPrice: { type: Type.NUMBER },
          total: { type: Type.NUMBER },
        },
        required: ['description', 'total'],
      },
    },
  },
  required: ['provider', 'invoiceDate', 'totalAmount', 'taxAmount', 'currency'],
};


const fileToGenerativePart = (base64Data: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
};

export const extractInvoiceData = async (file: File): Promise<Omit<Invoice, 'id' | 'fileName'>> => {
    const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (error) => reject(error);
    });

    const generativePart = fileToGenerativePart(base64Data, file.type);

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                generativePart,
                { text: 'Extract all relevant information from this invoice and format it according to the provided JSON schema. If a value is not found, use a reasonable default like an empty string or 0.' }
            ]
        },
        config: {
            responseMimeType: 'application/json',
            responseSchema: invoiceSchema,
        },
    });
    
    const jsonString = result.text.trim();
    return JSON.parse(jsonString) as Omit<Invoice, 'id' | 'fileName'>;
};

export const getFinancialInsights = async (invoices: Invoice[], question: string): Promise<string> => {
    if (invoices.length === 0) {
        return "There are no invoices to analyze. Please upload some invoices first.";
    }

    const context = `
        You are an expert AI financial assistant. Your name is Factur_totCOS.
        Based *only* on the following invoice data, answer the user's question.
        Do not make up information. If the answer cannot be found in the data, say so.
        Be concise and helpful.
        
        Invoice Data (JSON format):
        ${JSON.stringify(invoices, null, 2)}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${context}\n\nUser Question: "${question}"`
    });

    return response.text;
};
