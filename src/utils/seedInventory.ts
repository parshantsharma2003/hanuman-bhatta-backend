import Inventory from '../models/Inventory';

const INITIAL_GRADE_INVENTORY = [
  {
    grade: 'Grade 1',
    productName: 'First Class Bricks',
    localName: 'Awwal / अव्वल',
    availableQuantity: 50000,
    reservedQuantity: 0,
    dispatchedQuantity: 0,
    stockStatus: 'In Stock' as const,
    internalRemarks: 'Primary kiln production active',
    lastUpdated: new Date(),
  },
  {
    grade: 'Grade 1.5',
    productName: 'Standard Bricks',
    localName: 'Laal Peti / लाल पेटी',
    availableQuantity: 30000,
    reservedQuantity: 0,
    dispatchedQuantity: 0,
    stockStatus: 'In Stock' as const,
    internalRemarks: 'Regular batch ready in chamber 2',
    lastUpdated: new Date(),
  },
  {
    grade: 'Grade 2',
    productName: 'Second Class Bricks',
    localName: 'Duyam / दुयम',
    availableQuantity: 25000,
    reservedQuantity: 0,
    dispatchedQuantity: 0,
    stockStatus: 'In Stock' as const,
    internalRemarks: 'Secondary chambers cooling',
    lastUpdated: new Date(),
  },
  {
    grade: 'Grade 3',
    productName: 'Third Class Bricks',
    localName: 'Peela Eent / पीला',
    availableQuantity: 15000,
    reservedQuantity: 0,
    dispatchedQuantity: 0,
    stockStatus: 'In Stock' as const,
    internalRemarks: 'Foundation filling batch available',
    lastUpdated: new Date(),
  },
  {
    grade: 'Grade 4',
    productName: 'Fourth Class Bricks',
    localName: 'Chatka Eent / छटका',
    availableQuantity: 20000,
    reservedQuantity: 0,
    dispatchedQuantity: 0,
    stockStatus: 'In Stock' as const,
    internalRemarks: 'Hard vitrified bats in south yard',
    lastUpdated: new Date(),
  },
];

export const ensureInventory = async (): Promise<void> => {
  const existing = await Inventory.findOne().exec();

  if (!existing) {
    const total = INITIAL_GRADE_INVENTORY.reduce((acc, curr) => acc + curr.availableQuantity, 0);
    await Inventory.create({
      totalBricks: total,
      availableTrolleys: Math.floor(total / 3000),
      items: INITIAL_GRADE_INVENTORY,
    });
    console.log('✅ Inventory initialized with 5-grade stock tracking');
    return;
  }

  // If existing record does not have the 5 items, populate them
  if (!existing.items || existing.items.length === 0) {
    existing.items = INITIAL_GRADE_INVENTORY as any;
    if (existing.totalBricks === 0) {
      existing.totalBricks = INITIAL_GRADE_INVENTORY.reduce((acc, curr) => acc + curr.availableQuantity, 0);
      existing.availableTrolleys = Math.floor(existing.totalBricks / 3000);
    }
    await existing.save();
    console.log('✅ Existing inventory upgraded to 5-grade stock tracking');
  }
};
