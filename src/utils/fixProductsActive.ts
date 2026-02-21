import mongoose from 'mongoose';
import Product from '../models/Product';
import { connectDatabase } from '../config/database';

const fixProductsActive = async () => {
  try {
    await connectDatabase();
    console.log('Connected to database');

    // Get all products
    const allProducts = await Product.find();
    console.log(`\nFound ${allProducts.length} total products:`);
    
    allProducts.forEach(product => {
      console.log(`- ${product.name}: isActive=${product.isActive}, availability=${product.availability}`);
    });

    // Update all products to have isActive: true and availability: true
    const result = await Product.updateMany(
      {},
      { 
        $set: { 
          isActive: true,
          availability: true 
        } 
      }
    );

    console.log(`\n✅ Updated ${result.modifiedCount} products`);

    // Verify the update
    const updatedProducts = await Product.find({ isActive: true });
    console.log(`\n✅ Verified: ${updatedProducts.length} products now have isActive=true`);
    
    updatedProducts.forEach(product => {
      console.log(`- ${product.name}: isActive=${product.isActive}, availability=${product.availability}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
};

fixProductsActive();
