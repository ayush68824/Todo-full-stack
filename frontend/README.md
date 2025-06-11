# Todo App Frontend

A modern, responsive Todo application built with React, TypeScript, and Material-UI.

## Features

- User authentication (login/register)
- Task management (create, read, update, delete)
- Task filtering and sorting
- Search functionality
- Responsive design
- Real-time feedback with toast notifications

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   VITE_API_URL=https://todo-full-stack-2.onrender.com/api
   ```

## Development

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building for Production

To create a production build:

```bash
npm run build
```

## Deployment to Vercel

1. Push your code to a GitHub repository
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Configure the following settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. Add the environment variable:
   - `VITE_API_URL`: `https://todo-full-stack-2.onrender.com/api`
6. Deploy!

## Technologies Used

- React
- TypeScript
- Material-UI
- React Router
- Axios
- React Toastify
- Vite

## Project Structure

```
src/
  ├── components/
  │   ├── auth/
  │   │   ├── Login.tsx
  │   │   ├── Register.tsx
  │   │   └── PrivateRoute.tsx
  │   └── dashboard/
  │       └── Dashboard.tsx
  ├── context/
  │   └── AuthContext.tsx
  ├── App.tsx
  └── main.tsx
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 