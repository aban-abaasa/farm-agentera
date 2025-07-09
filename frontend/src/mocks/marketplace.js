// Import images for categories
import leaseImage from '../../../assets/images/lease_land.jpeg';
import cropProduce from '../../../assets/images/crop_produce.jpg';
import tractorService from '../../../assets/images/tractor_services.jpg';

// Import mock data
import { landListingsMockData } from '../pages/marketplace/mockData/landListings';
import { produceListingsMockData } from './produceListings';
import { serviceListingsMockData } from './serviceListings';

// Mock data for marketplace categories
export const marketplaceCategories = [
    {
      id: 'land',
      title: 'Land',
      description: 'Find farmland for lease, purchase, or partnership',
      image: leaseImage,
      link: '/marketplace/land',
      count: landListingsMockData.length
    },
    {
      id: 'produce',
      title: 'Produce',
      description: 'Buy and sell crops, seeds, and agricultural products',
      image: cropProduce,
      link: '/marketplace/produce',
      count: produceListingsMockData.length
    },
    {
      id: 'services',
      title: 'Services',
      description: 'Offer or find agricultural services and expertise',
      image: tractorService,
      link: '/marketplace/services',
      count: serviceListingsMockData.length
    }
  ];
  