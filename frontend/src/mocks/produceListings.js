import coffeeBeans from '../assets/images/coffee_beans.jpg'
import maize1 from '../assets/images/maize1.jpg'

export const produceListingsMockData = [
  {
    id: 101,
    title: 'Fresh Coffee Beans (100kg)',
    price: '1,200,000 UGX',
    location: 'Mbale, Eastern Region',
    type: 'produce',
    category: 'Crops',
    quantity: '100 kg',
    quality: 'Premium',
    features: ['Arabica', 'Sun-dried', 'Organic', 'Hand-sorted', 'Direct from farm'],
    description: 'Premium Arabica coffee beans from the highlands of Mbale. Sun-dried and sorted for quality. Perfect for export or local roasting. These beans were harvested from our family-owned plantation at an altitude of 1,800m. We follow organic farming practices and traditional processing methods to ensure the highest quality.',
    images: [coffeeBeans],
    seller: {
      id: 'user2',
      name: 'Robert Okello',
      avatar: null,
      phone: '+256 701 987654',
      email: 'robert.okello@example.com',
      rating: 4.9,
      listings: 5,
      memberSince: '2021-08-10'
    },
    details: {
      variety: 'SL28 & SL34 Arabica',
      harvestDate: '2023-04-01',
      processingMethod: 'Washed and sun-dried',
      gradeOrClassification: 'AA',
      certification: 'Organic (not certified)',
      packaging: 'Available in 60kg bags or smaller quantities',
      storageConditions: 'Stored in dry, cool warehouse',
      shelfLife: '12 months when properly stored',
      deliveryOptions: 'Pickup available or delivery within Uganda for additional fee'
    },
    postedDate: '2023-04-15',
    expiryDate: '2023-06-15'
  },
  {
    id: 102,
    title: 'Organic Maize Seeds (50kg)',
    price: '450,000 UGX',
    location: 'Kampala, Central Region',
    type: 'produce',
    category: 'Seeds',
    quantity: '50 kg',
    quality: 'Premium',
    features: ['Organic', 'High-yield', 'Drought-resistant', 'Non-GMO', 'Local variety'],
    description: 'High-quality organic maize seeds suitable for planting. These seeds are from a drought-resistant local variety that has been proven to perform well in Ugandan conditions. The seeds have been carefully selected and tested for germination rate (95%+). Ideal for farmers looking for reliable, organic seed stock.',
    images: [maize1
    ],
    seller: {
      id: 'user7',
      name: 'James Muwonge',
      avatar: null,
      phone: '+256 702 876543',
      email: 'james.muwonge@example.com',
      rating: 4.7,
      listings: 3,
      memberSince: '2022-02-15'
    },
    details: {
      variety: 'Longe 5 (local drought-resistant variety)',
      harvestDate: '2023-03-15',
      processingMethod: 'Sun-dried and sorted',
      germinationRate: '95%',
      certification: 'Organic (not certified)',
      packaging: 'Available in 5kg, 10kg, and 50kg bags',
      storageConditions: 'Store in cool, dry place',
      plantingInstructions: 'Plant at beginning of rainy season, 2-3 seeds per hole',
      treatmentApplied: 'None - completely natural'
    },
    postedDate: '2023-04-10',
    expiryDate: '2023-07-10'
  },
  {
    id: 103,
    title: 'Fresh Pineapples (500 pieces)',
    price: '750,000 UGX',
    location: 'Kayunga, Central Region',
    type: 'produce',
    category: 'Fruits',
    quantity: '500 pieces',
    quality: 'Standard',
    features: ['Fresh', 'Sweet', 'Ripe', 'Medium-sized', 'Direct from farm'],
    description: 'Fresh, sweet pineapples harvested from our farm in Kayunga. These fruits are picked at optimal ripeness and are ready for immediate sale or distribution. Ideal for markets, hotels, restaurants, or juice processing. Discount available for bulk purchase of the entire lot.',
    images: [
      'https://source.unsplash.com/random?pineapple,fresh',
      'https://source.unsplash.com/random?pineapple,harvest',
      'https://source.unsplash.com/random?pineapple,fruit'
    ],
    seller: {
      id: 'user8',
      name: 'Rose Nakito',
      avatar: null,
      phone: '+256 703 765432',
      email: 'rose.nakito@example.com',
      rating: 4.8,
      listings: 7,
      memberSince: '2021-11-20'
    },
    details: {
      variety: 'Smooth Cayenne',
      harvestDate: '2023-05-15',
      size: 'Medium, approx. 1.5kg each',
      sweetness: 'High sugar content, 16-18 Brix',
      packaging: 'Available in crates of 10, 20, or 50 pieces',
      storageConditions: 'Best consumed within 5-7 days of purchase',
      deliveryOptions: 'Can arrange transport to Kampala for additional fee',
      additionalNotes: 'Volume discount available for purchase of entire lot'
    },
    postedDate: '2023-05-16',
    expiryDate: '2023-05-26'
  },
  {
    id: 104,
    title: 'Premium Vanilla Beans (10kg)',
    price: '3,500,000 UGX',
    location: 'Fort Portal, Western Region',
    type: 'produce',
    category: 'Spices',
    quantity: '10 kg',
    quality: 'Export',
    features: ['Organic', 'Long beans', 'High vanillin content', 'Hand-cured', 'Export quality'],
    description: 'Premium quality vanilla beans grown and processed using traditional methods. These beans have been carefully hand-pollinated, harvested at peak ripeness, and cured for optimal flavor and aroma. Ideal for export, gourmet food production, or premium retail. Limited quantity available.',
    images: [
      'https://source.unsplash.com/random?vanilla,beans',
      'https://source.unsplash.com/random?vanilla,spice',
      'https://source.unsplash.com/random?vanilla,cured'
    ],
    seller: {
      id: 'user9',
      name: 'Charles Mugisha',
      avatar: null,
      phone: '+256 704 654321',
      email: 'charles.mugisha@example.com',
      rating: 5.0,
      listings: 2,
      memberSince: '2022-01-05'
    },
    details: {
      variety: 'Vanilla planifolia',
      harvestDate: '2023-01-10',
      processingMethod: 'Traditional Ugandan method, hand-cured for 6 months',
      gradeOrClassification: 'Grade A, export quality',
      beanLength: '18-22cm',
      vanillinContent: 'High, 2.5-3.0%',
      packaging: 'Vacuum-sealed packages of 1kg',
      storageConditions: 'Store in cool, dry place away from direct sunlight',
      certification: 'Organic certification in process'
    },
    postedDate: '2023-04-05',
    expiryDate: '2023-07-05'
  },
  {
    id: 105,
    title: 'Fresh Tilapia Fish (200kg)',
    price: '1,800,000 UGX',
    location: 'Jinja, Eastern Region',
    type: 'produce',
    category: 'Livestock',
    quantity: '200 kg',
    quality: 'Premium',
    features: ['Fresh', 'Farm-raised', 'Medium-sized', 'Same-day harvest', 'Bulk discount'],
    description: 'Fresh tilapia harvested from our sustainable fish farm near Lake Victoria. These fish are raised in clean water with high-quality feed for the best taste and texture. Available for immediate purchase. Ideal for restaurants, hotels, or markets. Can arrange same-day delivery for freshness.',
    images: [
      'https://source.unsplash.com/random?tilapia,fish',
      'https://source.unsplash.com/random?fish,fresh',
      'https://source.unsplash.com/random?fishery,farm'
    ],
    seller: {
      id: 'user10',
      name: 'Peter Ochieng',
      avatar: null,
      phone: '+256 705 543210',
      email: 'peter.ochieng@example.com',
      rating: 4.6,
      listings: 4,
      memberSince: '2021-10-15'
    },
    details: {
      variety: 'Nile Tilapia (Oreochromis niloticus)',
      harvestDate: 'Harvested on order for maximum freshness',
      size: 'Medium, 300-500g per fish',
      farmingMethod: 'Sustainable pond farming',
      packaging: 'Packed in ice for transport',
      storageConditions: 'Keep refrigerated, best consumed within 2 days',
      deliveryOptions: 'Same-day delivery available within 50km radius',
      additionalNotes: 'Can process (scale, gut) upon request for additional fee'
    },
    postedDate: '2023-05-18',
    expiryDate: '2023-05-25'
  },
  {
    id: 106,
    title: 'Fresh Milk (500 liters)',
    price: '600,000 UGX',
    location: 'Mbarara, Western Region',
    type: 'produce',
    category: 'Dairy',
    quantity: '500 liters',
    quality: 'Standard',
    features: ['Fresh', 'Cow milk', 'Unpasteurized', 'Daily supply', 'Bulk orders'],
    description: 'Fresh cow milk available daily from our dairy farm in Mbarara. This milk comes from healthy, grass-fed cows and is suitable for processing or direct consumption after pasteurization. We can supply this volume daily for long-term buyers. Ideal for dairy processors, cheese makers, or milk distributors.',
    images: [
      'https://source.unsplash.com/random?milk,fresh',
      'https://source.unsplash.com/random?dairy,farm',
      'https://source.unsplash.com/random?cows,milk'
    ],
    seller: {
      id: 'user11',
      name: 'Agnes Kobusingye',
      avatar: null,
      phone: '+256 706 432109',
      email: 'agnes.kobusingye@example.com',
      rating: 4.7,
      listings: 3,
      memberSince: '2022-03-01'
    },
    details: {
      source: 'Friesian and local cross-breed cows',
      fatContent: 'Approximately 3.8-4.2%',
      milkingProcess: 'Twice daily, morning and evening',
      feeding: 'Grass-fed with minimal supplements',
      packaging: 'Available in 20L or 50L containers (buyer provides containers)',
      storageConditions: 'Must be refrigerated immediately',
      deliveryOptions: 'Daily pickup from farm, delivery negotiable for long-term contracts',
      additionalNotes: 'Consistent daily supply available with advance arrangement'
    },
    postedDate: '2023-05-17',
    expiryDate: '2023-05-24'
  }
]; 