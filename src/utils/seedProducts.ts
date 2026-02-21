import Product from '../models/Product';

export const seedProducts = async (): Promise<void> => {
  const existingCount = await Product.countDocuments().exec();

  if (existingCount > 0) {
    return;
  }

  const defaultProducts = [
    {
      name: 'First Class Bricks',
      slug: 'first-class-bricks',
      type: 'Avval',
      pricePer1000: 4500,
      pricePerTrolley: 13500,
      availability: true,
    },
    {
      name: 'Second Class Bricks',
      slug: 'second-class-bricks',
      type: 'Second Class',
      pricePer1000: 3500,
      pricePerTrolley: 10500,
      availability: true,
    },
    {
      name: 'Brick Bats',
      slug: 'brick-bats',
      type: 'Rora',
      pricePer1000: 2500,
      pricePerTrolley: 7500,
      availability: true,
    },
  ];

  await Product.insertMany(defaultProducts);

  console.log('✅ Products seeded');
};
