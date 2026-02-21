import Product, { ProductDocument } from '../models/Product';

export const getAllProducts = async (): Promise<ProductDocument[]> => {
  const products = await Product.find().sort({ createdAt: -1 }).lean().exec();
  return products as unknown as ProductDocument[];
};
