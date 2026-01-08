# Ugandan Farmers Hub - Frontend

This is the frontend for the Ugandan Farmers Hub application, built with React, Vite, Material UI, and Tailwind CSS.

## Overview

The Ugandan Farmers Hub is a comprehensive platform designed to connect farmers across Uganda, enabling them to:

- Buy, sell, or lease agricultural land
- Trade produce and agricultural products
- Offer and find farming services
- Share knowledge and collaborate
- Access weather updates and resources
- Build a community of agricultural practitioners

## Features

- **User Authentication**: Secure registration and login system
- **Marketplace**: Platform for trading land, produce, and services
- **Dashboard**: Personalized user dashboard with analytics and notifications
- **Community**: Forums and discussion boards for knowledge sharing
- **Resources**: Access to agricultural resources and educational materials
- **Weather Updates**: Location-specific weather forecasts and farming calendars
- **Profiles**: Detailed user profiles with reputation system

## Technologies Used

- **React**: Frontend library for building user interfaces
- **Vite**: Fast and modern build tool for web development
- **React Router**: For client-side routing
- **Material UI**: Component library for design system
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Formik & Yup**: Form handling and validation
- **Axios**: HTTP client for API requests
- **React Query**: Data fetching and state management
- **Leaflet**: For map integrations

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or later)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd AGRI-TECH/frontend
```

2. Install dependencies
```bash
npm install
# or
yarn
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
frontend/
├── public/              # Static files
├── src/
│   ├── assets/          # Images, fonts, etc.
│   ├── components/      # Reusable components
│   │   ├── layout/      # Layout components
│   │   ├── ui/          # UI components
│   │   └── ...
│   ├── context/         # React context providers
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   │   ├── auth/        # Authentication pages
│   │   ├── marketplace/ # Marketplace pages
│   │   └── ...
│   ├── services/        # API services
│   ├── utils/           # Utility functions
│   ├── App.jsx          # Main app component
│   ├── App.css          # App-specific styles
│   ├── index.css        # Global styles and Tailwind imports
│   ├── main.jsx         # Entry point
│   └── theme.js         # Material UI theme configuration
├── .eslintrc.js         # ESLint configuration
├── index.html           # HTML template
├── package.json         # Project dependencies
├── postcss.config.js    # PostCSS configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── vite.config.js       # Vite configuration
```

## Backend Integration

This frontend is designed to work with the Ugandan Farmers Hub backend API. For development purposes, some features use mock data and localStorage for persistence.

## Design System

The application uses a combination of Material UI components and Tailwind CSS for styling. Custom theme settings are defined in `src/theme.js`.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Ugandan Farming Community
- Agricultural Extension Workers
- Ministry of Agriculture, Uganda
