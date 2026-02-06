import { ShippingOption, ShippingCalculation, PudoSize } from '@/types';

// PUDO Shipping Options (South Africa)
export const SHIPPING_OPTIONS: ShippingOption[] = [
  { size: 'small', max_weight: 5, price: 60 },
  { size: 'medium', max_weight: 10, price: 80 },
  { size: 'large', max_weight: 15, price: 100 },
];

/**
 * Calculate shipping cost based on total cart weight
 * Uses PUDO locker size pricing for South Africa
 */
export function calculateShipping(totalWeightKg: number): ShippingCalculation {
  // Find the appropriate shipping option
  const option = SHIPPING_OPTIONS.find(opt => totalWeightKg <= opt.max_weight);
  
  if (!option) {
    // If weight exceeds all options, return the largest with a warning
    const largestOption = SHIPPING_OPTIONS[SHIPPING_OPTIONS.length - 1];
    return {
      size: largestOption.size,
      price: largestOption.price,
      total_weight: totalWeightKg,
    };
  }

  return {
    size: option.size,
    price: option.price,
    total_weight: totalWeightKg,
  };
}

/**
 * Format shipping size for display
 */
export function formatShippingSize(size: PudoSize): string {
  const sizeMap = {
    small: 'Small (up to 5kg)',
    medium: 'Medium (up to 10kg)',
    large: 'Large (up to 15kg)',
  };
  return sizeMap[size];
}

/**
 * Get shipping price by size
 */
export function getShippingPrice(size: PudoSize): number {
  const option = SHIPPING_OPTIONS.find(opt => opt.size === size);
  return option?.price || 0;
}
