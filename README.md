# Vite + React + TypeScript Project

This is a template project bootstrapped with Vite, React, and TypeScript. It includes a basic setup for a modern web application.

## Project Structure

The project structure is as follows:

```
.
├── public/                  # Static assets
├── src/
│   ├── components/          # Reusable UI components
│   │   └── ui/              # Shadcn/ui components (example)
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions
│   ├── pages/               # Page components
│   ├── App.css              # Main App component styles
│   ├── App.tsx              # Main App component
│   ├── index.css            # Global styles
│   ├── main.tsx             # Application entry point
│   └── vite-env.d.ts        # Vite environment type definitions
├── .gitignore
├── components.json          # Shadcn/ui configuration
├── eslint.config.js       # ESLint configuration
├── index.html               # Main HTML file
├── package-lock.json
├── package.json
├── postcss.config.js        # PostCSS configuration
├── README.md                # This file
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.app.json        # TypeScript configuration for the app
├── tsconfig.json            # Base TypeScript configuration
├── tsconfig.node.json       # TypeScript configuration for Node.js (e.g., Vite config)
└── vite.config.ts           # Vite configuration
```

## Available Scripts

In the project directory, you can run:

### `npm install`

Installs the project dependencies.

### `npm run dev`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) (or the port shown in your terminal) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `dist` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

### `npm run lint`

Lints the project files using ESLint.

### `npm run preview`

Serves the production build locally to preview it before deployment.

## Learn More

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://reactjs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn/ui](https://ui.shadcn.com/)