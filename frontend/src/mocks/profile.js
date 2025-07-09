// Mock user data
export const mockUserData = {
    id: 'user1',
    name: 'John Muwanga',
    email: 'john.muwanga@example.com',
    phone: '+256 700 123456',
    location: 'Kampala, Uganda',
    bio: 'Passionate farmer with 10 years of experience in crop production. Specializing in coffee and maize farming in central Uganda.',
    avatar: null,
    coverPhoto: 'https://source.unsplash.com/random?farm,landscape',
    joinDate: '2022-01-15',
    role: 'Farmer',
    farmSize: '15 acres',
    specialty: 'Coffee, Maize',
    certifications: ['Organic Farming', 'Good Agricultural Practices'],
    social: {
      facebook: 'https://facebook.com/johnmuwanga',
      twitter: 'https://twitter.com/johnmuwanga',
    },
    stats: {
      listingsCount: 5,
      rating: 4.8,
      reviewsCount: 12,
      followers: 45,
      following: 32
    }
  };

// Mock user listings
export const mockUserListings = [
    {
      id: 1,
      title: '20 Acres Farmland in Mbarara',
      type: 'land',
      price: '4,500,000 UGX/month',
      location: 'Mbarara, Western Region',
      image: 'https://source.unsplash.com/random?farmland',
      createdAt: '2023-05-15',
      status: 'active'
    },
    {
      id: 2,
      title: 'Coffee Beans (100kg)',
      type: 'produce',
      price: '1,200,000 UGX',
      location: 'Kampala, Central Region',
      image: 'https://source.unsplash.com/random?coffee,beans',
      createdAt: '2023-06-20',
      status: 'active'
    },
    {
      id: 3,
      title: 'Maize Seeds (50kg)',
      type: 'produce',
      price: '450,000 UGX',
      location: 'Kampala, Central Region',
      image: 'https://source.unsplash.com/random?maize,seeds',
      createdAt: '2023-04-10',
      status: 'sold'
    },
    {
      id: 4,
      title: 'Farm Equipment Rental',
      type: 'service',
      price: 'Various prices',
      location: 'Kampala, Central Region',
      image: 'https://source.unsplash.com/random?farm,equipment',
      createdAt: '2023-07-05',
      status: 'active'
    },
    {
      id: 5,
      title: '5 Acres Rice Field',
      type: 'land',
      price: '2,000,000 UGX/month',
      location: 'Jinja, Eastern Region',
      image: 'https://source.unsplash.com/random?rice,field',
      createdAt: '2023-03-15',
      status: 'inactive'
    }
  ];
  