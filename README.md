# Rock Paper Scissors AI

A modern Rock Paper Scissors game built with Next.js and React, featuring an AI opponent with multiple difficulty levels.

## Features

- **Multiple Difficulty Levels**: Easy (random), Medium (pattern-based), and Hard (future enhancement)
- **AI Predictions**: In Medium mode, the AI shows what it thinks you'll pick
- **Smooth Animations**: Built with Framer Motion for engaging interactions
- **Responsive Design**: Mobile-first design that works on all devices
- **Modern Tech Stack**: Next.js 15, React 19, TypeScript, and Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- Yarn (preferred package manager)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd rock-paper-scissors-ai
```

2. Install dependencies:
```bash
yarn install
```

3. Run the development server:
```bash
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Game Modes

- **Easy**: AI makes random choices
- **Medium**: AI analyzes your playing patterns and tries to predict your next move
- **Hard**: Advanced AI (future enhancement)

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Animation**: Framer Motion
- **Development**: ESLint, TypeScript strict mode

## Project Structure

```
├── app/                 # Next.js App Router pages
├── components/          # Reusable React components
├── lib/                # Utility functions and game logic
└── public/             # Static assets
```

## Contributing

This project follows modern React and Next.js best practices:

- TypeScript strict mode enabled
- ESLint for code quality
- Functional components with hooks
- Server Components by default
- Mobile-first responsive design

## License

MIT License