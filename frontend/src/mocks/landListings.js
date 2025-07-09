import land1 from '../assets/images/land1.jpg'

export const landListingsMockData = [
  {
    id: 1,
    title: '20 Acres Farmland in Mbarara',
    price: '4,500,000 UGX/month',
    location: 'Mbarara, Western Region',
    size: '20 acres',
    type: 'land',
    listingType: 'Lease',
    features: ['Fertile soil', 'Water access', 'Road access', 'Flat terrain', 'Previously cultivated'],
    description: 'Fertile agricultural land available for lease. Suitable for crop farming. Reliable water source and good road access. The land has been used for maize and beans cultivation for the past 5 years with excellent yields. Looking for serious farmers interested in a minimum 2-year lease.',
    images: [ land1],
    owner: {
      id: 'user1',
      name: 'John Muwanga',
      avatar: null,
      phone: '+256 700 123456',
      email: 'john.muwanga@example.com',
      rating: 4.8,
      listings: 3,
      memberSince: '2022-01-15'
    },
    details: {
      soilType: 'Loam',
      terrain: 'Mostly flat, slight slope on eastern side',
      waterSource: 'River nearby, two wells on property',
      previousCrops: 'Maize, beans, sweet potatoes',
      accessRoads: 'All-weather murram road to property',
      nearbyMarkets: 'Mbarara central market (15km)',
      leaseTerms: 'Minimum 2 years, payment quarterly',
      additionalNotes: 'Possibility of equipment sharing with neighboring farm'
    },
    postedDate: '2023-04-15',
    expiryDate: '2023-07-15'
  },
  {
    id: 2,
    title: '5 Acres Rice Field in Jinja',
    price: '2,000,000 UGX/month',
    location: 'Jinja, Eastern Region',
    size: '5 acres',
    type: 'land',
    listingType: 'Lease',
    features: ['Irrigated', 'Flat terrain', 'Previously cultivated', 'Suitable for rice', 'Water access'],
    description: 'Well-maintained rice field available for lease. The land has been used for rice cultivation for the past 3 years with good yields. Irrigation system already set up. Looking for experienced rice farmers for a long-term lease arrangement.',
    images: [
      'https://source.unsplash.com/random?rice,field',
      'https://source.unsplash.com/random?paddy,field',
      'https://source.unsplash.com/random?agriculture,irrigation'
    ],
    owner: {
      id: 'user2',
      name: 'Sarah Namugosa',
      avatar: null,
      phone: '+256 701 234567',
      email: 'sarah.namugosa@example.com',
      rating: 4.6,
      listings: 2,
      memberSince: '2022-03-20'
    },
    details: {
      soilType: 'Clay loam',
      terrain: 'Flat',
      waterSource: 'Irrigation canal from nearby river',
      previousCrops: 'Rice',
      accessRoads: 'Dirt road, accessible during dry season',
      nearbyMarkets: 'Jinja central market (8km)',
      leaseTerms: 'Minimum 1 year, payment quarterly',
      additionalNotes: 'Owner provides technical support for irrigation system'
    },
    postedDate: '2023-05-10',
    expiryDate: '2023-08-10'
  },
  {
    id: 3,
    title: '10 Acres Coffee Plantation for Sale',
    price: '85,000,000 UGX',
    location: 'Mbale, Eastern Region',
    size: '10 acres',
    type: 'land',
    listingType: 'Sale',
    features: ['Established coffee trees', 'Hillside location', 'Good altitude', 'Water access', 'Storage facility'],
    description: 'Established coffee plantation with mature arabica trees for sale. Located at an optimal altitude for high-quality coffee production. The plantation includes a small storage facility and basic processing equipment. Perfect opportunity for someone looking to enter the coffee industry with an established plantation.',
    images: [
      'https://source.unsplash.com/random?coffee,plantation',
      'https://source.unsplash.com/random?coffee,farm',
      'https://source.unsplash.com/random?coffee,trees'
    ],
    owner: {
      id: 'user3',
      name: 'Robert Okello',
      avatar: null,
      phone: '+256 702 345678',
      email: 'robert.okello@example.com',
      rating: 4.9,
      listings: 1,
      memberSince: '2021-11-05'
    },
    details: {
      soilType: 'Volcanic loam',
      terrain: 'Hillside, moderate slope',
      waterSource: 'Natural spring on property, rainfall harvesting system',
      treesAge: '5-8 years, productive',
      varietals: 'SL28 and SL34 Arabica',
      accessRoads: 'Gravel road, accessible year-round',
      nearbyMarkets: 'Coffee cooperative (5km), Mbale town (15km)',
      additionalNotes: 'Consistent coffee quality score of 83+ points'
    },
    postedDate: '2023-03-20',
    expiryDate: '2023-09-20'
  },
  {
    id: 4,
    title: '15 Acres Mixed Farmland near Kampala',
    price: '3,800,000 UGX/month',
    location: 'Wakiso, Central Region',
    size: '15 acres',
    type: 'land',
    listingType: 'Lease',
    features: ['Fertile soil', 'Partially forested', 'Stream access', 'Close to Kampala', 'Mixed use potential'],
    description: 'Versatile farmland available for lease near Kampala. Suitable for mixed farming with areas appropriate for crops, livestock, and poultry. Part of the land has mature fruit trees. Good access to Kampala markets makes this ideal for commercial farming ventures targeting urban consumers.',
    images: [
      'https://source.unsplash.com/random?farm,mixed',
      'https://source.unsplash.com/random?farm,fruit',
      'https://source.unsplash.com/random?farm,livestock'
    ],
    owner: {
      id: 'user4',
      name: 'David Ssentongo',
      avatar: null,
      phone: '+256 703 456789',
      email: 'david.ssentongo@example.com',
      rating: 4.7,
      listings: 4,
      memberSince: '2022-02-10'
    },
    details: {
      soilType: 'Mixed - loam and sandy loam',
      terrain: 'Gentle slopes, partially forested',
      waterSource: 'Year-round stream, two boreholes',
      previousUse: 'Mixed farming - fruits, vegetables, and small livestock',
      accessRoads: 'All-weather road to property',
      nearbyMarkets: 'Kampala central market (25km)',
      leaseTerms: 'Minimum 3 years, payment quarterly',
      additionalNotes: 'Existing structures include small barn and storage shed'
    },
    postedDate: '2023-06-05',
    expiryDate: '2023-09-05'
  },
  {
    id: 5,
    title: '8 Acres Maize Farm in Gulu',
    price: '1,800,000 UGX/month',
    location: 'Gulu, Northern Region',
    size: '8 acres',
    type: 'land',
    listingType: 'Lease',
    features: ['Fertile soil', 'Flat terrain', 'Previously cultivated', 'Good for cereals', 'Seasonal water access'],
    description: 'Productive farmland in Northern Uganda available for lease. The land has been consistently used for maize and sorghum with good yields. Ideal for farmers looking to expand their cereal production. The owner is open to flexible lease arrangements with serious farmers.',
    images: [
      'https://source.unsplash.com/random?maize,farm',
      'https://source.unsplash.com/random?farmland,cereal',
      'https://source.unsplash.com/random?agriculture,harvest'
    ],
    owner: {
      id: 'user5',
      name: 'Florence Akello',
      avatar: null,
      phone: '+256 704 567890',
      email: 'florence.akello@example.com',
      rating: 4.5,
      listings: 2,
      memberSince: '2022-04-15'
    },
    details: {
      soilType: 'Sandy loam',
      terrain: 'Flat',
      waterSource: 'Seasonal stream, rain-dependent',
      previousCrops: 'Maize, sorghum, groundnuts',
      accessRoads: 'Dirt road, may be difficult during heavy rains',
      nearbyMarkets: 'Gulu town market (12km)',
      leaseTerms: 'Flexible, minimum 1 year',
      additionalNotes: 'Possibility of equipment sharing with neighboring farms'
    },
    postedDate: '2023-05-20',
    expiryDate: '2023-08-20'
  },
  {
    id: 6,
    title: '3 Acres Vegetable Farm with Greenhouse',
    price: '2,500,000 UGX/month',
    location: 'Mukono, Central Region',
    size: '3 acres',
    type: 'land',
    listingType: 'Lease',
    features: ['Greenhouse', 'Irrigation system', 'Fertile soil', 'Close to Kampala', 'Ready for production'],
    description: 'Ready-to-use vegetable farm with modern greenhouse facilities. The property includes a 500m² greenhouse with drip irrigation system, suitable for high-value vegetable production. The remaining land is prepared for open field cultivation. Ideal for commercial vegetable growers targeting Kampala\'s premium markets.',
    images: [
      'https://source.unsplash.com/random?greenhouse,vegetables',
      'https://source.unsplash.com/random?farm,vegetables',
      'https://source.unsplash.com/random?drip,irrigation'
    ],
    owner: {
      id: 'user6',
      name: 'Maria Nakato',
      avatar: null,
      phone: '+256 705 678901',
      email: 'maria.nakato@example.com',
      rating: 5.0,
      listings: 1,
      memberSince: '2022-01-30'
    },
    details: {
      soilType: 'Enriched loam',
      terrain: 'Flat',
      waterSource: 'Borehole with solar pump, water storage tanks',
      previousCrops: 'Tomatoes, peppers, leafy greens',
      accessRoads: 'Tarmac road to property entrance',
      nearbyMarkets: 'Kampala premium markets (20km)',
      leaseTerms: 'Minimum 2 years, payment quarterly',
      additionalNotes: 'Technical support available for greenhouse operations for first 3 months'
    },
    postedDate: '2023-06-10',
    expiryDate: '2023-09-10'
  }
]; 