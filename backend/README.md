# AGRI-TECH Platform Backend

This directory contains the backend code for the AGRI-TECH platform, including the database schema, API server, and utility scripts.

## Database Structure

The database is organized into several logical sections:

1. **Auth & Profiles** - User authentication and profile information
2. **Resources** - Educational resources and materials for farmers
3. **Events** - Community events and registrations
4. **Marketplace** - Listings for land, produce, and services
5. **Community** - Forums, Q&A, and discussions

### Schema Organization

The database schema is split into multiple files for better organization:

- `schemas/01_auth_tables.sql` - User authentication and profiles
- `schemas/02_resources_tables.sql` - Resource categories, resources, tags, and ratings
- `schemas/03_events_tables.sql` - Community events and event registrations
- `schemas/04_marketplace_tables.sql` - Marketplace listings (land, produce, services)
- `schemas/05_community_tables.sql` - Forums, posts, questions, and comments

Additional utility SQL files:
- `add_is_deleted_column.sql` - Adds soft delete capability to tables

## Marketplace Listings Structure

The marketplace uses a base table (`marketplace_listings`) with specialized tables for each listing type:

1. **Base Table**: `marketplace_listings` - Common fields for all listing types
2. **Specialized Tables**:
   - `land_listings` - For farmland sales and leases
   - `produce_listings` - For agricultural products
   - `service_listings` - For farming services and equipment rental

Each specialized table has a foreign key reference to the base table, creating a one-to-one relationship.

## Setting Up the Database

### Prerequisites

- PostgreSQL 12+ or Supabase account
- Python 3.8+
- Required Python packages: `psycopg2`, `python-dotenv`

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
# Option 1: Use DATABASE_URL
DATABASE_URL=postgresql://username:password@localhost:5432/agritech_db

# Option 2: Use individual connection parameters
DB_HOST=localhost
DB_PORT=5432
DB_NAME=agritech_db
DB_USER=username
DB_PASSWORD=password
```

### Initializing the Database

Run the initialization script to create all the necessary tables:

```bash
python db/initialize_db.py
```

This script will:
1. Connect to the database using the provided credentials
2. Execute the schema files in the correct order
3. Apply any additional SQL files

## API Server

The API server is built with Express.js and provides endpoints for interacting with the database.

### Starting the Server

```bash
npm install
npm start
```

The server will start on port 3000 by default (configurable via the `PORT` environment variable).

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Log in an existing user
- `GET /api/auth/profile` - Get the current user's profile
- `PUT /api/auth/profile` - Update the current user's profile

### Marketplace Endpoints

- `GET /api/marketplace/listings` - Get all marketplace listings
- `GET /api/marketplace/listings/:id` - Get a specific listing
- `POST /api/marketplace/listings` - Create a new listing
- `PUT /api/marketplace/listings/:id` - Update a listing
- `DELETE /api/marketplace/listings/:id` - Delete a listing

Specialized endpoints for each listing type:
- `GET /api/marketplace/land` - Get all land listings
- `GET /api/marketplace/produce` - Get all produce listings
- `GET /api/marketplace/services` - Get all service listings

## Contributing

Please follow these guidelines when contributing to the backend:

1. Create a new branch for each feature or bugfix
2. Write clear, descriptive commit messages
3. Add appropriate tests for new functionality
4. Update documentation as needed
5. Submit a pull request for review