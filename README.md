# noteable.ai

A dictation application with proper noun recognition and correction. Record your thoughts, and the app will transcribe them while identifying and highlighting proper nouns (names, places, companies, brands) for easy correction and improved future suggestions.

## Features

- **Voice Recording**: Record audio directly in the browser
- **Speech-to-Text**: Transcription powered by OpenAI Whisper Large V3 model
- **Proper Noun Detection**: AI-powered identification of proper nouns using Claude
- **Smart Corrections**: Click on highlighted proper nouns to see suggested corrections or enter custom ones
- **Learning System**: The app remembers your corrections and uses them to improve future suggestions
- **Note Management**: Save, view, and delete your transcribed notes and proper noun corrections (local storage)

## How It Works

1. **Record**: Click the microphone button to start recording your thoughts
2. **Transcribe**: When you stop recording, the audio is sent for transcription
3. **Analyze**: The transcription is then analyzed by Claude to identify proper nouns
4. **Correct**: Proper nouns are highlighted by type:
   - **Blue**: People
   - **Green**: Places
   - **Purple**: Companies
   - **Orange**: Brands
   - **Amber**: Other proper nouns
5. **Save**: Make any corrections and save your note

## Tech Stack

- **Framework**: Next/Node
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn
- **State Management**: TanStack React Query
- **Validation**: Zod for runtime type validation
- **APIs**:
  - [Groq](https://groq.com/) - Speech-to-text (OpenAI Whisper Large V3)
  - [Anthropic](https://anthropic.com/) - Proper noun analysis (Claude)

## Project Structure

```
notable-ai/
├── app/
│   ├── api/
│   │   └── transcribe/
│   │       ├── route.tsx      # API endpoint for transcription
│   │       ├── utils.ts       # Transcription and proper noun functions
│   │       └── constants.ts   # System prompt for Claude
│   ├── notes/
│   │   └── page.tsx           # Notes listing page
│   ├── proper-nouns/
│   │   └── page.tsx           # Corrections listing page
│   ├── layout.tsx             # Root layout with sidebar
│   ├── page.tsx               # Home page (contains recording UI)
│   └── providers.tsx          # React Query provider
├── components/
│   ├── ui/                    # Reusable UI components (shadcn/ui style)
│   ├── sidebar.tsx            # Navigation sidebar
│   └── TranscribedText.tsx    # Transcription display with corrections
├── hooks/
│   ├── useRecordAudio.ts      # Audio recording hook
│   └── use-mobile.ts          # Mobile detection hook
├── lib/
│   ├── utils.ts               # Utility functions (cn, segmentTranscription)
│   ├── notesStorage.ts        # localStorage helpers for notes
│   └── correctionsStorage.ts  # localStorage helpers for corrections
└── public/                    # Static assets
```

## Getting Started

### Production
- You can test this now on [https://notable-ai.vercel.app/](https://notable-ai.vercel.app/)

### Prerequisites for localdev

- Node.js 18+
- npm, yarn, pnpm, or bun
- API keys for Groq and Anthropic

### Environment Variables

Create a `.env.local` file in the root directory:

```env
GROQ_API_KEY=your_groq_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd notable-ai

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

### Development

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Build

```bash
npm run build
npm run start
```

## Pages

### Home (`/`)
The main recording interface. Click the microphone button to record, click again to stop and transcribe. View and correct the transcription, then save as a note.

### Notes (`/notes`)
View all saved notes in a card grid. Each note displays the transcribed text with a delete button.

### Proper Noun Corrections (`/proper-nouns`)
View all corrections you've made. These corrections are automatically included in future transcription requests to improve suggestion accuracy.

## Key Components

### TranscribedText
Displays the transcription with proper nouns highlighted and clickable. Each proper noun opens a popover with:
- A custom correction input field
- Suggested corrections from the AI

### useRecordAudio Hook
Manages browser audio recording using the MediaRecorder API. Returns:
- `startRecording()`: Begin recording
- `stopRecording()`: Stop and return audio blob
- `isRecording`: Current recording state

## API Endpoint

### POST `/api/transcribe`

Accepts audio files and returns transcription with proper noun analysis.

**Request**: `multipart/form-data`
- `audioFile`: Audio blob (webm format)
- `corrections` (optional): JSON string of previous user corrections

**Response**:
```json
{
  "transcription": "string",
  "properNouns": {
    "properNouns": [
      {
        "original": "string",
        "corrections": ["string"],
        "confidence": "high|medium|low",
        "type": "person|place|company|brand|other"
      }
    ]
  }
}
```

## Data Storage

The app uses browser localStorage for persistence:

- **Notes**: Stored under `notable-notes` key
- **Corrections**: Stored under `notable-corrections` key

Each entry includes:
- Unique ID (UUID)
- Content (text or original/corrected pair)
- Timestamp

## Browser Requirements

- Microphone access permission
- Modern browser with MediaRecorder API support (Chrome, Firefox, Edge, Safari 14.1+)

## License

MIT
