import User from '../models/User';
import Inventory from '../models/Inventory';
import Product from '../models/Product';

interface StartupCheckResult {
  adminExists: boolean;
  inventoryExists: boolean;
  productsExist: boolean;
  productCount: number;
}

export const verifyStartup = async (): Promise<StartupCheckResult> => {
  const results: StartupCheckResult = {
    adminExists: false,
    inventoryExists: false,
    productsExist: false,
    productCount: 0,
  };

  try {
    // Check admin user
    const adminCount = await User.countDocuments({ role: { $in: ['super_admin', 'admin'] } }).exec();
    results.adminExists = adminCount > 0;

    if (results.adminExists) {
      console.log('✅ Admin users verified');
    } else {
      console.warn('⚠️  No admin user found - authentication may fail');
    }

    // Check inventory
    const inventoryCount = await Inventory.countDocuments().exec();
    results.inventoryExists = inventoryCount > 0;

    if (results.inventoryExists) {
      const inventory = await Inventory.findOne().lean().exec() as any;
      console.log(`✅ Inventory verified (${inventory?.totalBricks || 0} bricks, ${inventory?.availableTrolleys || 0} trolleys)`);
    } else {
      console.warn('⚠️  No inventory document found');
    }

    // Check products
    const productCount = await Product.countDocuments().exec();
    results.productCount = productCount;
    results.productsExist = productCount > 0;

    if (results.productsExist) {
      console.log(`✅ Products verified (${productCount} products available)`);
    } else {
      console.warn('⚠️  No products found - catalog may be empty');
    }

    console.log('');
  } catch (error) {
    console.error('❌ Error during startup verification:', error instanceof Error ? error.message : error);
    throw error;
  }

  return results;
};
