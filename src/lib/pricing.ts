import { createBrowserClient } from '@supabase/ssr';

export type PricingMode = 'hourly' | 'fixed';

export interface PricingSettings {
  pricing_mode: PricingMode;
  currency: string;
  service_fee_percent: number;
  min_rate: number;
  max_rate: number;
}

/**
 * Fetches the global pricing settings from the settings table.
 * Defaults to hourly if not found.
 */
export async function getPricingSettings(): Promise<PricingSettings> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 'global')
    .single();

  if (error || !data) {
    return {
      pricing_mode: 'hourly',
      currency: 'PKR',
      service_fee_percent: 10,
      min_rate: 300,
      max_rate: 5000,
    };
  }

  return data as PricingSettings;
}

/**
 * Formats a rate string based on the pricing mode and locale.
 * Example: "Rs 800/hr" or "Rs 800 Flat Rate"
 */
export function formatRate(rate: number, mode: PricingMode, locale: string = 'en'): string {
  const currency = 'Rs'; // Could be dynamic from settings
  
  if (mode === 'hourly') {
    return locale === 'ur' 
      ? `${currency} ${rate}/گھنٹہ` 
      : `${currency} ${rate}/hr`;
  }
  
  return locale === 'ur'
    ? `${currency} ${rate} فلیٹ ریٹ`
    : `${currency} ${rate} Flat Rate`;
}

/**
 * Calculates the total cost based on the rate and estimated hours.
 */
export function calculateTotal(rate: number, hours: number, mode: PricingMode): number {
  if (mode === 'hourly') {
    return rate * hours;
  }
  return rate;
}

/**
 * Calculates the service fee based on the total cost.
 */
export function calculateServiceFee(total: number, percent: number): number {
  return (total * percent) / 100;
}
