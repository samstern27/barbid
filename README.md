# BarBid

A modern web application connecting hospitality staff with job opportunities and helping businesses find qualified employees.

## Features

- **Job Management**: Post and manage job listings
- **Real-time Applications**: Live job application system
- **User Profiles**: Comprehensive user profiles with skills and experience
- **Location-based Search**: Find jobs by location
- **Modern UI**: Built with React + Vite for optimal performance
- **Responsive Design**: Works seamlessly on all devices

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS + Material Tailwind
- **Backend**: Firebase (Authentication, Realtime Database, Storage)
- **Maps**: Google Maps integration
- **UI Components**: Headless UI + Heroicons + TailwindPlus UI blocks

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Firebase project with Realtime Database
- Google Maps API key (required for location-based features)
- EmailJS account (for contact form functionality)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/barbid.git
   cd barbid
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   - Create a `.env.local` file in the root directory
   - Add your own Firebase and Google Maps API keys (see Environment Variables section below)
   - **Note:** The repository does not include any `.env` files for security reasons

4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

**Security Note:** This repository does not include any `.env` files to protect sensitive API keys. You must create your own environment file with your own API keys.

Create a `.env.local` file in the root directory with the following variables:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com/
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Maps API (required for location features)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# EmailJS Configuration (for contact form)
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

## Setup Instructions

### Firebase Setup

1. Create a Firebase project
2. Enable Authentication (Email/Password + Google)
3. Create a Realtime Database
4. Set up Storage for file uploads
5. Deploy the security rules from `database.rules.json`

### Google Maps Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Maps JavaScript API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security
6. Add the API key to your environment variables

### EmailJS Setup

1. Go to [EmailJS](https://www.emailjs.com/) and create a free account
2. Create an email service (Gmail, Outlook, etc.)
3. Create an email template for the contact form
4. Get your Service ID, Template ID, and Public Key from the dashboard
5. Add these values to your environment variables

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Landing/        # Landing page components
│   ├── UI/            # Generic UI components
│   └── User/          # User-specific components
├── contexts/           # React contexts for state management
├── firebase/           # Firebase configuration and utilities
├── pages/             # Page components
│   ├── Landing/       # Public pages
│   └── User/          # Authenticated user pages
├── services/          # Business logic and external services
└── utils/             # Utility functions
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Set up your environment (see Getting Started section)
4. Make your changes
5. Test your changes thoroughly
6. Commit your changes (`git commit -m 'Add some amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0) - see the [LICENSE](LICENSE) file for details.

**Important:** This license prohibits commercial use and protects the author from liability. Please read the full license before using this code.
