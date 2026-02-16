// Pudo API integration for shipping cost
import axios from 'axios';

// Read API key from environment. Do NOT commit real keys to source.
// Do NOT include secret API keys in client bundle. If a server-side proxy is available, set VITE_PUDO_PROXY_URL to call it.
const PUDO_API_KEY = import.meta.env.VITE_PUDO_API_KEY || '';
const PUDO_API_URL = import.meta.env.VITE_PUDO_API_URL || '';

export interface PudoQuoteRequest {
  origin: string;
  destination: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  service_type: string;
}

export interface PudoQuoteResponse {
  success: boolean;
  quote: {
    amount: number;
    currency: string;
    service: string;
    estimated_delivery_days: number;
  };
}

export async function getPudoShippingQuote(request: PudoQuoteRequest): Promise<PudoQuoteResponse> {
  // If no server-side proxy / API key is configured, return a mocked quote so the app remains functional.
  if (!PUDO_API_KEY || !PUDO_API_URL) {
    console.warn('Pudo API not configured — returning mocked quote');
    return {
      success: true,
      quote: {
        amount: Math.max(60, Math.round(request.weight) * 20),
        currency: 'ZAR',
        service: request.service_type,
        estimated_delivery_days: 2,
      },
    } as PudoQuoteResponse;
  }

  try {
    const response = await axios.post(PUDO_API_URL, request, {
      headers: {
        Authorization: `Bearer ${PUDO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    });
    return response.data as PudoQuoteResponse;
  } catch (err: any) {
    console.error('Pudo API error:', err?.response?.data || err.message || err);
    throw new Error('Failed to fetch shipping quote from Pudo');
  }
}
