// Mock data for dashboard
export const mockListings = [
    {
      id: 1,
      type: 'land',
      title: '5 Acres Farmland in Mbarara',
      price: '2,500,000 UGX/month',
      status: 'active',
      date: '2023-05-15',
      views: 45,
      inquiries: 7
    },
    {
      id: 2,
      type: 'produce',
      title: 'Fresh Maize Harvest (2 Tons)',
      price: '1,800,000 UGX',
      status: 'pending',
      date: '2023-05-10',
      views: 32,
      inquiries: 3
    }
  ];
  
export const mockMessages = [
{
    id: 1,
    sender: 'Sarah Namuli',
    avatar: null,
    message: 'I am interested in your farmland listing. Does it have access to water throughout the year?',
    date: '2023-05-18',
    unread: true
},
{
    id: 2,
    sender: 'Robert Okello',
    avatar: null,
    message: 'When will the coffee beans be available? I need to place an order for my export business.',
    date: '2023-05-16',
    unread: false
},
{
    id: 3,
    sender: 'Mary Achieng',
    avatar: null,
    message: 'The tractor rental service worked great! Thank you for recommending it.',
    date: '2023-05-14',
    unread: true
}
];

export const mockRecommendations = [
{
    id: 101,
    type: 'land',
    title: '10 Acres for Lease in Jinja',
    description: 'Fertile soil, good for crop farming, water access available.',
    price: '3,000,000 UGX/month',
    match: 95
},
{
    id: 102,
    type: 'partner',
    title: 'Looking for Poultry Farming Partner',
    description: 'Experienced farmer seeking partner for expanding poultry business.',
    location: 'Kampala',
    match: 87
},
{
    id: 103,
    type: 'service',
    title: 'Tractor Rental Service',
    description: 'Modern tractors available for rent at competitive prices.',
    price: '150,000 UGX/day',
    match: 82
}
];
  
export const mockCommunityActivity = [
{
    id: 201,
    user: 'John Muwanga',
    avatar: null,
    action: 'posted in',
    target: 'Crop Disease Prevention',
    date: '2023-05-17',
    content: 'Has anyone tried using neem oil to prevent aphids on vegetables?',
    likes: 12,
    replies: 8
},
{
    id: 202,
    user: 'Grace Akello',
    avatar: null,
    action: 'replied to your post in',
    target: 'Coffee Farmers Group',
    date: '2023-05-16',
    content: 'Your approach to shade-grown coffee is very sustainable!',
    likes: 5,
    replies: 2
},
{
    id: 203,
    user: 'Peter Otim',
    avatar: null,
    action: 'shared a resource in',
    target: 'Regenerative Farming',
    date: '2023-05-15',
    content: 'New guide on cover crops for Eastern Uganda climate conditions',
    likes: 18,
    replies: 4
}
];
  