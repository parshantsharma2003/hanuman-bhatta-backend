import Inventory, { InventoryDocument } from '../models/Inventory';

export const getLatestInventory = async (): Promise<InventoryDocument> => {
  const inventory = await Inventory.findOne().lean().exec();

  // Return default inventory if none exists (should be seeded)
  if (!inventory) {
    return {
      totalBricks: 0,
      availableTrolleys: 0,
    } as InventoryDocument;
  }

  return inventory as unknown as InventoryDocument;
};
