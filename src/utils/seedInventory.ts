import Inventory from '../models/Inventory';

export const ensureInventory = async (): Promise<void> => {
  const existing = await Inventory.findOne().exec();

  if (existing) {
    return;
  }

  await Inventory.create({
    totalBricks: 0,
    availableTrolleys: 0,
  });

  console.log('✅ Inventory seeded');
};
