# Rock Paper Scissors AI

A sophisticated Rock Paper Scissors game built with Next.js 15 and React 19, featuring an advanced adaptive AI opponent that learns from your playing patterns using machine learning.

## Features

- **Three Difficulty Levels**:
  - **Easy**: AI makes random choices for casual play
  - **Medium**: AI uses pattern recognition to predict your moves
  - **Hard**: Advanced adaptive AI with neural network learning
- **Machine Learning AI**: Uses TensorFlow.js and ML5.js for real-time learning
- **Pattern Analysis**: AI analyzes your playing patterns, transitions, and reactions
- **Real-time Predictions**: See what the AI thinks you'll play next
- **Adaptive Learning**: AI improves its predictions as you play more games
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Accessibility**: Full keyboard navigation and screen reader support

## AI Capabilities

The Hard mode AI features:

- **Neural Network Learning**: Uses TensorFlow.js for pattern recognition
- **Behavioral Analysis**: Tracks your win/loss reactions and choice transitions
- **Streak Detection**: Identifies if you tend to repeat or switch choices
- **Time-based Patterns**: Weights recent moves more heavily
- **Confidence Scoring**: Shows how certain the AI is about its predictions
- **Reasoning Display**: Explains why the AI made its prediction

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript 5
- **Styling**: Tailwind CSS 4 with custom gradients and animations
- **AI/ML**: TensorFlow.js, ML5.js for neural network learning
- **Animation**: Framer Motion for smooth interactions
- **Icons**: Lucide React for consistent iconography
- **Development**: ESLint 9, Prettier, TypeScript strict mode
- **Build Tools**: Next.js with Turbopack for fast development

## Installation

### Prerequisites

- Node.js 18+
- Yarn (preferred package manager)

### Setup

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd rock-paper-scissors-ai
   ```

2. **Install dependencies**:

   ```bash
   yarn install
   ```

3. **Start development server**:

   ```bash
   yarn dev
   ```

4. **Open your browser** and navigate to [http://localhost:3000](http://localhost:3000)

## How to Play

1. **Choose Difficulty**: Select from Easy, Medium, or Hard modes
2. **Make Your Choice**: Click Rock, Paper, or Scissors
3. **Watch the AI**: See the AI's prediction and reasoning (Medium/Hard modes)
4. **Learn Patterns**: The AI gets smarter the more you play (Hard mode)
5. **Challenge Yourself**: Try to outsmart the learning AI!

## Project Structure

```
rock-paper-scissors-ai/
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles and Tailwind
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Main game page
├── components/             # React components
│   ├── game-area/         # Game interaction components
│   │   ├── ai-section/    # AI avatar and predictions
│   │   └── player-section/ # Player choice buttons
│   ├── game-header/       # Difficulty selector and info
│   └── game-results/      # Game outcome display
├── hooks/                  # Custom React hooks
│   └── useGameLogic.ts    # Main game state management
├── lib/                    # Core game logic and AI
│   ├── context/           # React context providers
│   ├── game/              # Game logic and AI implementation
│   │   ├── adaptive-ai.ts # Neural network AI implementation
│   │   ├── logic.ts       # Core game rules
│   │   └── test-adaptive-ai.ts # AI testing utilities
└── public/                 # Static assets
```

## Available Scripts

- `yarn dev` - Start development server with Turbopack
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint
- `yarn format` - Format code with Prettier
- `yarn format:check` - Check code formatting
- `yarn analyze` - Analyze bundle size

## Testing the AI

The project includes a testing framework for the adaptive AI:

```typescript
// In browser console
const tester = new AdaptiveAITester();
await tester.runPatternTest();
await tester.testReasoning();
```

This allows you to verify the AI's learning capabilities and see how it adapts to different playing patterns.

---

_Built with ❤️ using Next.js 15, React 19, and TensorFlow.js_
