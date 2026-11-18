import Product from '../models/Product';

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const FIVE_STANDARD_BRICK_GRADES = [
  {
    productId: 'hbc-grade-1-awwal',
    productCode: 'HBC-AWWAL',
    name: 'First Class Bricks',
    localName: 'Awwal / Aaval / अव्वल',
    alternativeNames: ['Premium Bricks', 'Awwal', 'Aaval', 'Grade 1', 'Class 105', 'अव्वल ईंट'],
    slug: 'first-class-bricks-awwal',
    grade: 'Grade 1',
    category: 'Premium Quality',
    badge: 'BEST SELLER',
    pricePerBrick: 9.0,
    pricePer1000: 9000,
    pricePerTrolley: 27000,
    pricingUnit: 'INR',
    description:
      'Premium-quality red clay bricks manufactured for customers who prioritize strength, uniformity and high-quality finishing. Meticulously slow-fired at peak kiln temperature for maximum compressive resistance.',
    characteristics: [
      'Very hard and strong.',
      'Uniform size and weight.',
      'High-finish edges.',
      'White and red colour variation.',
      'High load-bearing capacity.',
      'Produces a clear metallic ringing sound when struck.',
    ],
    recommendedApplications: [
      'Major construction projects.',
      'House construction.',
      'Main structural walls.',
      'Foundations.',
      'Exterior walls.',
    ],
    colourDescription: 'White and red colour variation',
    soundDescription: 'Clear metallic ringing sound',
    strengthLevel: 'Very High (Structural Load-Bearing)',
    usageTags: [
      'Major Construction',
      'House Construction',
      'Main Structural Walls',
      'Foundations',
      'Exterior Walls',
    ],
    qualityGrade: 'First',
    imageUrl: '/images/premium-brick.jpg',
    images: ['/images/premium-brick.jpg'],
    type: 'Class 105 Structural Masonry',
    isActive: true,
    isFeatured: true,
    displayOrder: 1,
    availabilityStatus: 'In Stock' as const,
    availability: true,
    isArchived: false,
  },
  {
    productId: 'hbc-grade-1-5-standard',
    productCode: 'HBC-LAALPETI',
    name: 'Standard Bricks',
    localName: 'Laal Peti / Lal Petty / लाल पेटी ईंट',
    alternativeNames: ['Laal Peti', 'Lal Petty', 'Grade 1.5', 'लाल पेटी'],
    slug: 'standard-bricks-laal-peti',
    grade: 'Grade 1.5',
    category: 'Standard Quality',
    badge: 'POPULAR CHOICE',
    pricePerBrick: 8.5,
    pricePer1000: 8500,
    pricePerTrolley: 25500,
    pricingUnit: 'INR',
    description:
      'An affordable alternative to premium Awwal bricks, offering good finishing and rich visual colour, suitable for general construction applications where appropriate.',
    characteristics: [
      'High-finished edges.',
      'Pure red colour.',
      'Less strength than First Class bricks.',
      'Produces a metallic sound, slightly duller than Awwal.',
    ],
    recommendedApplications: [
      'Non-load-bearing walls.',
      'Partition walls.',
      'Boundary walls.',
    ],
    colourDescription: 'Pure red colour',
    soundDescription: 'Metallic sound, slightly duller than Awwal',
    strengthLevel: 'Medium-High (General Masonry)',
    usageTags: ['Non-load-bearing walls', 'Partition walls', 'Boundary walls'],
    qualityGrade: 'Grade-1.5',
    imageUrl: '/images/brick-texture.jpg',
    images: ['/images/brick-texture.jpg'],
    type: 'Standard Masonry Red Brick',
    isActive: true,
    isFeatured: false,
    displayOrder: 2,
    availabilityStatus: 'In Stock' as const,
    availability: true,
    isArchived: false,
  },
  {
    productId: 'hbc-grade-2-duyam',
    productCode: 'HBC-DUYAM',
    name: 'Second Class Bricks',
    localName: 'Duyam / 2 Number Eent / दुयम',
    alternativeNames: ['Duyam', '2 Number Eent', 'Grade 2', 'दोयम ईंट'],
    slug: 'second-class-bricks-duyam',
    grade: 'Grade 2',
    category: 'Budget Friendly',
    badge: 'ECONOMICAL',
    pricePerBrick: 8.0,
    pricePer1000: 8000,
    pricePerTrolley: 24000,
    pricingUnit: 'INR',
    description:
      'An economical brick option with lower strength and less uniform appearance compared with higher grades. Ideal for budget-friendly non-critical builds.',
    characteristics: [
      'Light red and yellowish colour.',
      'Very dull sound when struck.',
      'Lower strength than the higher grades.',
      'Budget-friendly pricing.',
    ],
    recommendedApplications: [
      'Suitable non-critical construction.',
      'Temporary construction.',
      'Lower-budget projects.',
    ],
    colourDescription: 'Light red and yellowish colour',
    soundDescription: 'Very dull sound when struck',
    strengthLevel: 'Moderate (Secondary Masonry)',
    usageTags: ['Non-critical construction', 'Temporary construction', 'Lower-budget projects'],
    qualityGrade: 'Second',
    type: 'Secondary Masonry Brick',
    isActive: true,
    isFeatured: false,
    displayOrder: 3,
    availabilityStatus: 'In Stock' as const,
    availability: true,
    isArchived: false,
  },
  {
    productId: 'hbc-grade-3-peela',
    productCode: 'HBC-PEELA',
    name: 'Third Class Bricks',
    localName: 'Peela Eent / पीला ईंट',
    alternativeNames: ['Peela Eent', 'Grade 3', 'Third Class', 'पीली ईंट'],
    slug: 'third-class-bricks-peela',
    grade: 'Grade 3',
    category: 'Economy',
    badge: 'UTILITY FILLING',
    pricePerBrick: 7.5,
    pricePer1000: 7500,
    pricePerTrolley: 22500,
    pricingUnit: 'INR',
    description:
      'A low-cost, lower-quality brick option intended for limited applications where high structural strength is not required.',
    characteristics: [
      'Yellowish colour.',
      'Very low strength.',
      'Very dull sound when struck.',
      'Low-cost option.',
    ],
    recommendedApplications: [
      'Suitable filling below soil level in foundations.',
      'Temporary construction.',
    ],
    colourDescription: 'Yellowish colour',
    soundDescription: 'Very dull sound when struck',
    strengthLevel: 'Low (Non-Structural / Foundation Filling)',
    usageTags: ['Foundation filling below soil', 'Temporary construction'],
    qualityGrade: 'Third',
    type: 'Under-Fired Sub-Grade Utility Brick',
    isActive: true,
    isFeatured: false,
    displayOrder: 4,
    availabilityStatus: 'In Stock' as const,
    availability: true,
    isArchived: false,
  },
  {
    productId: 'hbc-grade-4-chatka',
    productCode: 'HBC-CHATKA',
    name: 'Fourth Class Bricks',
    localName: 'Chatka Eent / छटका ईंट',
    alternativeNames: ['Chatka Eent', 'Chatka', 'Grade 4', 'Fourth Class', 'छटका'],
    slug: 'fourth-class-bricks-chatka',
    grade: 'Grade 4',
    category: 'Low-Cost Irregular Bricks',
    badge: 'HARD VITRIFIED',
    pricePerBrick: 6.0,
    pricePer1000: 6000,
    pricePerTrolley: 18000,
    pricingUnit: 'INR',
    description:
      'Hard, irregularly shaped kiln bricks available at the lowest price among the five grades. Because these bricks have irregular shapes, they are not presented as equivalent to regular structural masonry bricks, but offer superb compaction strength for filling.',
    characteristics: [
      'Very hard.',
      'Irregular shape and size.',
      'High hardness and strength as described by the business.',
      'Irregular colour.',
      'Lowest price among the five grades.',
    ],
    recommendedApplications: [
      'Temporary construction.',
      'Filling applications.',
    ],
    colourDescription: 'Irregular dark reddish-purple vitrified body',
    soundDescription: 'Sharp vitrified clink',
    strengthLevel: 'High Hardness (Irregular Geometry)',
    usageTags: ['Ground compaction', 'Temporary construction', 'Filling applications'],
    qualityGrade: 'Fourth',
    type: 'Vitrified Clinker / Irregular Bat Aggregate',
    isActive: true,
    isFeatured: false,
    displayOrder: 5,
    availabilityStatus: 'In Stock' as const,
    availability: true,
    isArchived: false,
  },
];

export const seedProducts = async (): Promise<void> => {
  // 1. Rename any legacy "Brick Bats" to "Premium Bricks" and set rate to 9 rupee per brick and 9000 per 1000 bricks
  await Product.updateMany(
    { name: { $regex: /brick\s*bats/i } },
    {
      $set: {
        name: 'Premium Bricks',
        localName: 'Premium / अव्वल',
        pricePerBrick: 9.0,
        pricePer1000: 9000,
        pricePerTrolley: 27000,
        isActive: true,
      },
    }
  );

  // 2. Ensure Second Class Bricks has localName 'Duyam / 2 Number Eent / दुयम' and rate 8 rupee per brick and 8000 per 1000 bricks
  await Product.updateMany(
    {
      $or: [
        { name: { $regex: /second\s*class/i } },
        { localName: { $regex: /duyam/i } },
        { productId: 'hbc-grade-2-duyam' },
      ],
    },
    {
      $set: {
        name: 'Second Class Bricks',
        localName: 'Duyam / 2 Number Eent / दुयम',
        pricePerBrick: 8.0,
        pricePer1000: 8000,
        pricePerTrolley: 24000,
      },
    }
  );

  // Upsert the five standard brick grades so existing systems upgrade smoothly without losing data
  for (const item of FIVE_STANDARD_BRICK_GRADES) {
    const existing = await Product.findOne({
      $or: [
        { productId: item.productId },
        { slug: item.slug },
        { name: item.name },
      ],
    });

    if (existing) {
      // Update missing fields while preserving custom admin overrides
      await Product.findByIdAndUpdate(existing._id, {
        $set: {
          productId: item.productId,
          productCode: item.productCode,
          localName: item.localName,
          alternativeNames: item.alternativeNames,
          grade: item.grade,
          category: item.category,
          badge: item.badge,
          characteristics: item.characteristics,
          recommendedApplications: item.recommendedApplications,
          colourDescription: item.colourDescription,
          soundDescription: item.soundDescription,
          strengthLevel: item.strengthLevel,
          displayOrder: item.displayOrder,
          // Always ensure rates are updated to standard requested rates
          pricePerBrick: item.pricePerBrick,
          pricePer1000: item.pricePer1000,
          pricePerTrolley: item.pricePerTrolley,
        },
      });
    } else {
      await Product.create(item);
    }
  }

  // Also ensure standalone "Premium Bricks" is present
  const premiumExisting = await Product.findOne({
    $or: [
      { name: 'Premium Bricks' },
      { slug: 'premium-bricks' },
      { productId: 'hbc-premium-bricks' },
    ],
  });
  if (!premiumExisting) {
    await Product.create({
      productId: 'hbc-premium-bricks',
      productCode: 'HBC-PREMIUM',
      name: 'Premium Bricks',
      localName: 'Premium / अव्वल (Awwal)',
      alternativeNames: ['Premium Bricks', 'Awwal', 'First Class Bricks', 'Grade 1'],
      slug: 'premium-bricks',
      grade: 'Grade 1',
      category: 'Premium Quality',
      badge: 'PREMIUM QUALITY',
      pricePerBrick: 9.0,
      pricePer1000: 9000,
      pricePerTrolley: 27000,
      pricingUnit: 'INR',
      description:
        'High-strength premium kiln-fired red clay bricks with 10.5+ N/mm² compressive strength, uniform terracotta color, and metallic ringing sound for load-bearing walls.',
      characteristics: [
        'Very hard and strong body.',
        'Uniform size and weight.',
        'High-finish sharp edges.',
        'Produces a clear metallic ringing sound when struck.',
        'High load-bearing capacity.',
      ],
      recommendedApplications: [
        'Major construction projects.',
        'House construction.',
        'Main structural load-bearing walls.',
        'Foundations and exterior facades.',
      ],
      colourDescription: 'Uniform red terracotta with sharp finish',
      soundDescription: 'Clear metallic ringing sound',
      strengthLevel: 'Very High (Structural Load-Bearing)',
      usageTags: ['Major Construction', 'House Construction', 'Main Structural Walls', 'Foundations'],
      qualityGrade: 'First',
      imageUrl: '/images/brick-texture.jpg',
      images: ['/images/brick-texture.jpg'],
      type: 'Class 105 Premium Structural Masonry',
      isActive: true,
      isFeatured: true,
      displayOrder: 1,
      availabilityStatus: 'In Stock',
      availability: true,
      isArchived: false,
    });
  }

  console.log('✅ Centralized brick products verified & synchronized');
};
