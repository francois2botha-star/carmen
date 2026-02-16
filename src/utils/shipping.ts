// PUDO Shipping Calculations

export type ShippingSize = 'small' | 'medium' | 'large';

export const SHIPPING_RATES = {
  small: 60,   // ≤5kg
  medium: 80,  // ≤10kg
  large: 100,  // ≤15kg
};

export const WEIGHT_LIMITS = {
  small: 5,
  medium: 10,
  large: 15,
};

export const calculateShippingSize = (totalWeight: number): ShippingSize => {
  if (totalWeight <= WEIGHT_LIMITS.small) return 'small';
  if (totalWeight <= WEIGHT_LIMITS.medium) return 'medium';
  return 'large';
};

export const calculateShippingCost = (totalWeight: number): number => {
  const size = calculateShippingSize(totalWeight);
  return SHIPPING_RATES[size];
};

export const getShippingSizeLabel = (size: ShippingSize): string => {
  const labels = {
    small: 'Small (≤5kg)',
    medium: 'Medium (≤10kg)',
    large: 'Large (≤15kg)',
  };
  return labels[size];
};
