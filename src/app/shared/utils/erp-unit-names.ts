/**
 * ERP Unit ID to Store Name Mapping
 * Maps ERP unit IDs to their corresponding SolarShop store names
 */
export const ERP_UNIT_NAMES: Record<string, string> = {
  '01': 'SolarShop Buzin, Zagreb',
  '02': 'SolarShop Buzin, Zagreb',
  '03': 'SolarShop Središće, Zagreb',
  '04': 'SolarShop Split',
  '13': 'SolarShop Sesvete, Zagreb',
  '17': 'SolarShop Buzin, Zagreb',
  '21': 'SolarShop Zadar',
  '24': 'SolarShop Buzin, Zagreb',
  '28': 'SolarShop Rijeka',
  '30': 'SolarShop Jastrebarsko'
};

/**
 * Get the store name for a given unit ID
 * @param unitId - The ERP unit ID (e.g., '01', '28', etc.)
 * @param unitName - The ERP unit name (RADJEDNAZIV) as fallback
 * @returns The store name, or the unit name from ERP, or the unit ID
 */
export function getUnitName(unitId: string | undefined, unitName?: string): string {
  if (!unitId) return unitName || '';
  // Return mapped name if exists, otherwise return the unit name from ERP, or the unit ID
  return ERP_UNIT_NAMES[unitId] || unitName || unitId;
}

/**
 * Filter and combine ERP stock items
 * - Only includes units that are mapped in ERP_UNIT_NAMES
 * - Combines stock for units 01, 02, 17, 24 into a single "SolarShop Buzin, Zagreb" entry
 * @param stockItems - Array of stock items from ERP
 * @returns Filtered and combined stock items with display names
 */
export interface FilteredStockItem {
  unitId: string;
  displayName: string;
  quantity: number;
  wholesalePrice?: number;
  retailPrice?: number;
}

export function filterAndCombineErpStock(stockItems: any[]): FilteredStockItem[] {
  if (!stockItems || stockItems.length === 0) return [];

  // Filter to only include mapped units
  const mappedStock = stockItems.filter(item => ERP_UNIT_NAMES[item.unitId]);

  // Group Buzin units (01, 02, 17, 24)
  const buzinUnits = ['01', '02', '17', '24'];
  const buzinStock = mappedStock.filter(item => buzinUnits.includes(item.unitId));
  const otherStock = mappedStock.filter(item => !buzinUnits.includes(item.unitId));

  const result: FilteredStockItem[] = [];

  // Add combined Buzin stock if any exists
  if (buzinStock.length > 0) {
    const totalBuzinQuantity = buzinStock.reduce((sum, item) => sum + (item.quantity || 0), 0);

    // Use the first item's prices as representative (they should all be the same for the same store)
    const representativeItem = buzinStock[0];

    result.push({
      unitId: '01', // Use 01 as the representative ID
      displayName: 'SolarShop Buzin, Zagreb',
      quantity: totalBuzinQuantity,
      wholesalePrice: representativeItem.wholesalePrice,
      retailPrice: representativeItem.retailPrice
    });
  }

  // Add other mapped units
  otherStock.forEach(item => {
    result.push({
      unitId: item.unitId,
      displayName: ERP_UNIT_NAMES[item.unitId],
      quantity: item.quantity || 0,
      wholesalePrice: item.wholesalePrice,
      retailPrice: item.retailPrice
    });
  });

  return result;
}
