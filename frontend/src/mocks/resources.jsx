// Mock resource categories
export const resourceCategories = [
    {
      id: 'guides',
      title: 'Farming Guides',
      description: 'Step-by-step guides for various farming practices',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      id: 'market',
      title: 'Market Information',
      description: 'Current prices, trends, and market insights',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      )
    },
    {
      id: 'tech',
      title: 'Agricultural Technology',
      description: 'Modern farming technologies and innovations',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      id: 'education',
      title: 'Educational Videos',
      description: 'Video tutorials and training materials',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'funding',
      title: 'Funding & Grants',
      description: 'Information on financial support for farmers',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 'policy',
      title: 'Policy & Regulations',
      description: 'Agricultural policies and regulatory information',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
  ];
  
// Mock featured resources
export const featuredResources = [
{
    id: 1,
    title: 'Comprehensive Guide to Coffee Farming in Uganda',
    type: 'guide',
    thumbnail: 'https://source.unsplash.com/random?coffee,farm',
    source: 'Ministry of Agriculture',
    date: '2023-06-15',
    views: 3452,
    downloads: 1205
},
{
    id: 2,
    title: 'Sustainable Irrigation Techniques for Small Farms',
    type: 'guide',
    thumbnail: 'https://source.unsplash.com/random?irrigation',
    source: 'Agricultural Research Institute',
    date: '2023-05-22',
    views: 2876,
    downloads: 982
},
{
    id: 3,
    title: 'Market Trends: Ugandan Agricultural Exports 2023',
    type: 'market',
    thumbnail: 'https://source.unsplash.com/random?market,agriculture',
    source: 'Uganda Export Promotion Board',
    date: '2023-07-03',
    views: 4205,
    downloads: 1567
},
{
    id: 4,
    title: 'Pest Management in Maize Production',
    type: 'guide',
    thumbnail: 'https://source.unsplash.com/random?maize,corn',
    source: 'National Agricultural Research Organization',
    date: '2023-04-18',
    views: 3125,
    downloads: 1132
}
];
  
// Mock recent resources
export const recentResources = [
    {
        id: 5,
        title: 'Climate-Smart Agriculture Practices for Uganda',
        type: 'guide',
        thumbnail: 'https://source.unsplash.com/random?climate,farm',
        date: '2023-07-10'
    },
    {
        id: 6,
        title: 'Getting Started with Beekeeping',
        type: 'guide',
        thumbnail: 'https://source.unsplash.com/random?bees,honey',
        date: '2023-07-08'
    },
    {
        id: 7,
        title: 'Vertical Farming: Urban Agriculture Solutions',
        type: 'tech',
        thumbnail: 'https://source.unsplash.com/random?vertical,farm',
        date: '2023-07-05'
    },
    {
        id: 8,
        title: 'Livestock Vaccination Schedule 2023',
        type: 'guide',
        thumbnail: 'https://source.unsplash.com/random?livestock,cattle',
        date: '2023-07-02'
    },
    {
        id: 9,
        title: 'Applying for Agricultural Grants in Uganda',
        type: 'funding',
        thumbnail: 'https://source.unsplash.com/random?funding,money',
        date: '2023-06-28'
    },
    {
        id: 10,
        title: 'Introduction to Organic Certification',
        type: 'policy',
        thumbnail: 'https://source.unsplash.com/random?organic,certificate',
        date: '2023-06-25'
    }
    ];