import tractor1 from '../assets/images/tractor1.jpg'

export const serviceListingsMockData = [
  {
    id: 201,
    title: 'Tractor Service for Hire',
    price: '150,000 UGX/day',
    location: 'Gulu, Northern Region',
    type: 'service',
    category: 'Equipment',
    availability: 'Year-round',
    features: ['Modern machinery', 'Experienced operator', 'Plowing & harrowing', 'Land preparation', 'Timely service'],
    description: 'Professional tractor services with modern equipment. Available for plowing, harrowing, and other field preparations. Experienced operator included. We have been providing tractor services to farmers in Northern Uganda for over 5 years with excellent results. Our machinery is well-maintained and reliable.',
    images: [
      tractor1
    ],
    provider: {
      id: 'user3',
      name: 'Daniel Mugisha',
      avatar: null,
      phone: '+256 702 456789',
      email: 'daniel.mugisha@example.com',
      rating: 4.9,
      completedJobs: 47,
      memberSince: '2020-03-22'
    },
    details: {
      equipmentType: 'John Deere 5050D Tractor with various attachments',
      servicesOffered: 'Plowing, harrowing, ridging, planting, transportation',
      coverage: 'Gulu district and surrounding areas up to 50km',
      experienceYears: 8,
      priceDetails: '150,000 UGX per day (8 hours), fuel included, transport to site extra',
      bookingProcess: 'Requires 3 days advance booking, 50% deposit',
      cancelationPolicy: '24-hour notice required for cancellation without penalty',
      insuranceCoverage: 'Fully insured equipment and operator'
    },
    postedDate: '2023-04-10',
    expiryDate: '2023-10-10'
  },
  {
    id: 202,
    title: 'Agricultural Consultant - Crop Specialist',
    price: '200,000 UGX/visit',
    location: 'Kampala, Central Region',
    type: 'service',
    category: 'Consultancy',
    availability: 'Weekdays',
    features: ['Certified agronomist', 'Crop disease expert', 'Soil analysis', 'Yield optimization', 'Personalized advice'],
    description: 'Professional agricultural consultancy services specializing in crop production, disease management, and yield optimization. I provide on-site farm visits with personalized recommendations based on your specific situation. With a master\'s degree in Agricultural Sciences and 10 years of field experience, I can help you improve your farm\'s productivity and profitability.',
    images: [
      'https://source.unsplash.com/random?agriculture,consultant',
      'https://source.unsplash.com/random?farm,expert',
      'https://source.unsplash.com/random?crop,inspection'
    ],
    provider: {
      id: 'user12',
      name: 'Dr. Emmanuel Nkurunziza',
      avatar: null,
      phone: '+256 707 321098',
      email: 'emmanuel.nkurunziza@example.com',
      rating: 5.0,
      completedJobs: 124,
      memberSince: '2020-01-15'
    },
    details: {
      specialization: 'Crop diseases, soil fertility, and yield optimization',
      education: 'PhD in Agricultural Sciences, Makerere University',
      certifications: 'Certified Crop Advisor, Uganda Agricultural Association',
      experienceYears: 10,
      priceDetails: '200,000 UGX for initial visit and assessment, 150,000 UGX for follow-up visits',
      serviceIncludes: 'Farm assessment, soil testing recommendations, crop disease diagnosis, treatment plans, follow-up support',
      coverage: 'Can travel throughout Uganda (travel expenses apply for locations outside Kampala)',
      languages: 'English, Luganda, Runyankole, Swahili'
    },
    postedDate: '2023-04-20',
    expiryDate: '2023-10-20'
  },
  {
    id: 203,
    title: 'Farm Labor Team Available',
    price: '15,000 UGX/person/day',
    location: 'Mbarara, Western Region',
    type: 'service',
    category: 'Labor',
    availability: 'Seasonal',
    features: ['Experienced workers', 'Team of 10 people', 'Planting & harvesting', 'Weeding & maintenance', 'Reliable team'],
    description: 'Experienced agricultural labor team available for hire. Our team consists of 10 trained farm workers who can assist with planting, weeding, harvesting, and other farm tasks. We have worked together for 5+ years and are known for our reliability and quality work. Ideal for farms needing temporary labor for seasonal activities.',
    images: [
      'https://source.unsplash.com/random?farm,workers',
      'https://source.unsplash.com/random?harvest,workers',
      'https://source.unsplash.com/random?planting,team'
    ],
    provider: {
      id: 'user13',
      name: 'Joseph Tumusiime',
      avatar: null,
      phone: '+256 708 210987',
      email: 'joseph.tumusiime@example.com',
      rating: 4.7,
      completedJobs: 52,
      memberSince: '2021-02-10'
    },
    details: {
      teamSize: '10 experienced farm workers',
      specialization: 'Coffee harvesting, maize planting, general farm maintenance',
      availability: 'Available seasonally, especially during planting and harvest times',
      experienceYears: '5+ years working as a team',
      priceDetails: '15,000 UGX per person per day, minimum 5 workers per booking',
      accommodationRequirements: 'For multi-day assignments, basic on-site accommodation needed',
      bookingProcess: 'Requires 1 week advance notice, 30% deposit',
      references: 'References from previous employers available upon request'
    },
    postedDate: '2023-05-01',
    expiryDate: '2023-08-01'
  },
  {
    id: 204,
    title: 'Irrigation System Installation',
    price: 'From 2,500,000 UGX',
    location: 'Jinja, Eastern Region',
    type: 'service',
    category: 'Equipment',
    availability: 'Year-round',
    features: ['Drip systems', 'Sprinkler systems', 'Solar pumps', 'Water-efficient', 'Professional installation'],
    description: 'Professional irrigation system design and installation for farms of all sizes. We specialize in water-efficient systems including drip irrigation and solar-powered solutions. Our services include site assessment, system design, installation, and training on system maintenance. We use quality materials with warranty and provide after-sales support.',
    images: [
      'https://source.unsplash.com/random?irrigation,system',
      'https://source.unsplash.com/random?drip,irrigation',
      'https://source.unsplash.com/random?farm,irrigation'
    ],
    provider: {
      id: 'user14',
      name: 'David Mwesigwa',
      avatar: null,
      phone: '+256 709 109876',
      email: 'david.mwesigwa@example.com',
      rating: 4.8,
      completedJobs: 31,
      memberSince: '2021-05-20'
    },
    details: {
      specialization: 'Water-efficient irrigation systems, solar-powered systems',
      systemTypes: 'Drip irrigation, sprinkler systems, manual and automated systems',
      servicesIncluded: 'Site assessment, system design, installation, training, maintenance support',
      experienceYears: 7,
      priceDetails: 'Starting from 2,500,000 UGX depending on farm size and system type, free quote provided after site visit',
      warranty: '1-year warranty on installation, manufacturer warranty on equipment',
      paymentTerms: '40% deposit, 30% upon delivery of materials, 30% upon completion',
      maintenanceServices: 'Available for additional fee after warranty period'
    },
    postedDate: '2023-04-25',
    expiryDate: '2023-10-25'
  },
  {
    id: 205,
    title: 'Agricultural Transport Services',
    price: 'From 100,000 UGX',
    location: 'Kampala, Central Region',
    type: 'service',
    category: 'Transport',
    availability: 'Year-round',
    features: ['Various truck sizes', 'Nationwide service', 'Refrigerated options', 'Reliable delivery', 'Experienced drivers'],
    description: 'Reliable transportation services for agricultural products. We have a fleet of trucks in various sizes, including refrigerated vehicles for perishable goods. Our experienced drivers ensure safe and timely delivery. We operate nationwide and can handle both small and large volumes. Regular scheduled routes available for consistent needs.',
    images: [
      'https://source.unsplash.com/random?truck,transport',
      'https://source.unsplash.com/random?cargo,truck',
      'https://source.unsplash.com/random?delivery,agriculture'
    ],
    provider: {
      id: 'user15',
      name: 'Samuel Opio',
      avatar: null,
      phone: '+256 710 098765',
      email: 'samuel.opio@example.com',
      rating: 4.6,
      completedJobs: 78,
      memberSince: '2020-08-15'
    },
    details: {
      fleetSize: '8 trucks of various sizes (1-ton to 10-ton capacity)',
      vehicleTypes: 'Open trucks, covered trucks, refrigerated vehicles',
      coverage: 'Nationwide service, all regions of Uganda',
      specialization: 'Agricultural produce, both perishable and non-perishable',
      priceDetails: 'Starting from 100,000 UGX, depending on distance, volume, and vehicle type',
      insurance: 'All cargo insured during transit',
      bookingProcess: 'Requires 2 days advance booking, 50% deposit',
      regularRoutes: 'Scheduled weekly routes from major farming regions to Kampala available'
    },
    postedDate: '2023-05-05',
    expiryDate: '2023-11-05'
  },
  {
    id: 206,
    title: 'Organic Farming Training',
    price: '350,000 UGX/program',
    location: 'Wakiso, Central Region',
    type: 'service',
    category: 'Training',
    availability: 'Monthly programs',
    features: ['Certified trainer', 'Hands-on experience', 'Small groups', 'Practical techniques', 'Ongoing support'],
    description: 'Comprehensive organic farming training program for farmers looking to transition to organic methods or improve their existing practices. The program covers soil health, natural pest management, crop rotation, composting, and organic certification processes. Training includes both classroom sessions and practical field work on our demonstration farm.',
    images: [
      'https://source.unsplash.com/random?organic,farming',
      'https://source.unsplash.com/random?farm,training',
      'https://source.unsplash.com/random?agriculture,learning'
    ],
    provider: {
      id: 'user16',
      name: 'Grace Namutebi',
      avatar: null,
      phone: '+256 711 987654',
      email: 'grace.namutebi@example.com',
      rating: 4.9,
      completedJobs: 24,
      memberSince: '2021-01-25'
    },
    details: {
      programDuration: '5-day intensive program, with 3 months follow-up support',
      groupSize: 'Maximum 10 participants per program',
      curriculum: 'Soil health, composting, natural pest management, crop planning, marketing organic produce',
      certification: 'Certificate of completion provided, recognized by Uganda Organic Certification Association',
      experienceYears: '12 years in organic farming, 6 years as a trainer',
      priceIncludes: 'Training materials, lunches during training days, starter kit of organic inputs, follow-up farm visits',
      scheduleFrequency: 'Programs start on the first Monday of each month',
      accommodationOptions: 'Accommodation available for additional fee for participants from distant locations'
    },
    postedDate: '2023-04-15',
    expiryDate: '2023-10-15'
  }
]; 