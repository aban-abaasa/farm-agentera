# Marketplace API Integration - Migration from Mock Data

This document outlines the comprehensive changes made to replace mock data with real API integration across all marketplace functionality in the FARM-AGENT application.

## Overview of Changes

The marketplace system has been completely migrated from mock data to a full API-driven architecture using Supabase as the backend. This includes real database tables, API services, file storage, and updated frontend components.

## Database Schema Updates

### Core Tables

1. **marketplace_listings** - Base table for all listing types
   - Contains common fields: title, description, price, location, images, etc.
   - Supports different types: 'land', 'produce', 'service'
   - Includes geographic coordinates support with PostGIS

2. **Specialized Tables**:
   - **land_listings** - Land-specific details (size, soil type, access, etc.)
   - **produce_listings** - Produce-specific details (quantity, harvest date, organic status, etc.)
   - **service_listings** - Service-specific details (experience, equipment, service area, etc.)

3. **Supporting Tables**:
   - **user_saved_listings** - User favorites/bookmarks
   - **listing_messages** - Buyer-seller communication
   - **listing_reviews** - User reviews and ratings

### Key Features
- Row Level Security (RLS) policies for data protection
- Spatial indexing for location-based queries
- Automated status updates for expired listings
- Support for image uploads and storage

## API Services

### marketplaceService.js
Complete API service with the following functions:

#### Core Listing Operations
- `getListings(options)` - Fetch listings with filtering, sorting, pagination
- `getListingById(id, type)` - Get detailed listing with type-specific data
- `createListing(listingData, detailsData)` - Create new listings
- `updateListing(id, listingData, detailsData)` - Update existing listings
- `deleteListing(id)` - Delete listings

#### User Interactions
- `saveListing(listingId, userId)` - Save listing to favorites
- `unsaveListing(listingId, userId)` - Remove from favorites
- `getSavedListings(userId)` - Get user's saved listings
- `getUserListings(userId, options)` - Get user's own listings

#### Utility Functions
- `incrementListingView(id)` - Track listing views
- `changeListingStatus(id, status)` - Update listing status
- `searchListings(keyword, options)` - Search functionality
- `uploadListingImages(userId, files, listingType)` - Image upload

### storageService.js
File upload and management service:
- Image upload with validation
- Multiple file uploads
- File deletion and management
- Public URL generation
- Folder organization by user and listing type

## Frontend Component Updates

### 1. Marketplace.jsx (Main Hub)
**Changes Made:**
- Replaced mock data imports with API calls
- Added loading and error states
- Implemented real data fetching with useEffect
- Updated image handling for both stored and fallback images
- Added proper data filtering and sorting

**Key Features:**
- Fetches all active listings on component mount
- Filters featured listings dynamically
- Separates listings by type (land, produce, service)
- Responsive loading states and error handling

### 2. ProduceListings.jsx
**Changes Made:**
- Replaced mock data with API calls to `getListings({ type: 'produce' })`
- Added loading/error states
- Updated sorting logic to use `created_at` instead of mock fields
- Dynamic category extraction from real data

### 3. LandListings.jsx
**Changes Made:**
- Integrated real API calls for land listings
- Updated filtering logic for land-specific fields
- Added proper size sorting using `size_acres` field
- Loading and error state management

### 4. ServiceListings.jsx
**Changes Made:**
- Connected to service listings API
- Updated availability logic to use listing status
- Modified sorting to work with real data structure
- Added proper error handling

### 5. ListingDetails.jsx
**Changes Made:**
- Replaced mock data lookup with `getListingById()` API call
- Added view count increment functionality
- Implemented real save/unsave functionality
- Added similar listings fetching based on type and location
- Proper error handling for missing listings

### 6. CreateListing.jsx
**Already Implemented:**
- Uses real API services for creating listings
- Integrated with image upload service
- Proper form validation and submission

## Utility Functions

### marketplaceHelpers.js
Created comprehensive utility functions:

#### Data Formatting
- `formatPrice(listing)` - Handle negotiable prices and currency formatting
- `formatDate(dateString)` - Localized date formatting
- `formatTimeAgo(dateString)` - Relative time display
- `formatLocation(listing)` - Location display formatting

#### Display Helpers
- `getListingImageUrl(listing)` - Image URL with fallbacks
- `getStatusColor(status)` - MUI chip colors for status
- `getTypeDisplayName(type)` - Human-readable type names
- `getListingFeatures(listing)` - Extract type-specific features

#### Data Processing
- `sortListings(listings, sortBy, ascending)` - Client-side sorting
- `isListingExpired(listing)` - Expiration checking

## Image Handling Strategy

### Storage Structure
```
marketplace/
├── listings/
│   ├── land/
│   │   └── {userId}/
│   ├── produce/
│   │   └── {userId}/
│   └── service/
│       └── {userId}/
```

### Image Sources Priority
1. `listing.thumbnail` - Primary image
2. `listing.images[0]` - First image from array
3. Fallback to Unsplash with type-specific keywords

### File Upload Features
- Automatic file validation (type, size)
- Unique filename generation
- Multiple file upload support
- Progress tracking and error handling

## Error Handling Strategy

### API Level
- Consistent error response format
- Proper error logging
- Graceful fallbacks for missing data

### Component Level
- Loading states during API calls
- User-friendly error messages
- Retry mechanisms where appropriate
- Fallback content for missing images/data

## Security Considerations

### Database Security
- Row Level Security (RLS) policies implemented
- User can only modify their own listings
- Admin override capabilities
- Secure file upload validation

### API Security
- Authentication required for write operations
- Input validation and sanitization
- Rate limiting considerations
- Secure file upload handling

## Migration Checklist

### ✅ Completed
- [x] Database schema creation and policies
- [x] Complete API service implementation
- [x] File upload service integration
- [x] All marketplace components updated
- [x] Loading and error states added
- [x] Image handling with fallbacks
- [x] Utility functions for data formatting
- [x] Security policies implemented

### 🔄 Testing Required
- [ ] Test all CRUD operations
- [ ] Verify image upload functionality
- [ ] Test filtering and sorting
- [ ] Validate search functionality
- [ ] Check mobile responsiveness
- [ ] Test user permissions and security

### 📋 Future Enhancements
- [ ] Real-time messaging between buyers/sellers
- [ ] Advanced search with filters
- [ ] Map integration for location-based searches
- [ ] Push notifications for new listings
- [ ] Analytics and reporting dashboard
- [ ] Integration with payment systems

## Performance Considerations

### Optimization Strategies
- Pagination for large datasets
- Image optimization and lazy loading
- Caching strategies for frequently accessed data
- Database indexing for common queries
- CDN integration for static assets

### Monitoring
- API response time tracking
- Error rate monitoring
- User engagement analytics
- File upload success rates

## Development Guidelines

### Code Standards
- Consistent error handling patterns
- Proper TypeScript/PropTypes usage
- Component reusability
- API response standardization

### Testing Strategy
- Unit tests for utility functions
- Integration tests for API services
- Component testing with mock API responses
- End-to-end testing for complete user flows

This migration provides a solid foundation for a scalable, secure, and user-friendly marketplace system while maintaining backward compatibility and ensuring smooth user experience.
