# Audiobook Creator Website

A modern web application that allows users to create and listen to audiobooks by converting text to speech.

## Features

- **Text Input**: Users can post their text content with title and author
- **Text-to-Speech**: Built-in browser speech synthesis for audio playback
- **Audio Controls**: Play, pause, stop, and volume control
- **Modern UI**: Responsive design with beautiful gradients and animations
- **Real-time**: Instant audio generation without external APIs
- **Persistent Storage**: Audiobooks are saved and can be managed

## Technology Stack

- **Backend**: Node.js with Express
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Text-to-Speech**: Web Speech API (browser-native)
- **Styling**: Modern CSS with gradients and animations

## Installation

1. Make sure you have Node.js installed on your system
2. Clone or download this project
3. Open a terminal in the project directory
4. Install dependencies:

```bash
npm install
```

## Running the Application

1. Start the server:

```bash
npm start
```

2. Open your browser and navigate to `http://localhost:3000`

3. Start creating and listening to audiobooks!

## Usage

1. **Create an Audiobook**:
   - Fill in the title (required)
   - Add author name (optional)
   - Paste your text content in the textarea
   - Click "Create Audiobook"

2. **Listen to Audiobooks**:
   - Click the "Listen" button on any audiobook card
   - Use the audio controls in the modal:
     - Play/Pause button
     - Stop button
     - Volume slider

3. **Manage Audiobooks**:
   - View all your created audiobooks
   - Delete audiobooks you no longer need
   - See word count and estimated listening time

## Browser Compatibility

This application uses the Web Speech API, which is supported in:
- Chrome/Chromium browsers
- Safari
- Firefox
- Edge

## Features in Detail

### Text-to-Speech
- Uses browser-native speech synthesis
- Automatically selects the best available voice
- Configurable speech rate and volume
- No external API dependencies

### User Interface
- Responsive design that works on desktop and mobile
- Modern gradient background
- Smooth animations and transitions
- Intuitive audio player controls

### Data Management
- In-memory storage (resets when server restarts)
- RESTful API endpoints
- Real-time updates

## API Endpoints

- `GET /api/audiobooks` - Get all audiobooks
- `POST /api/audiobooks` - Create new audiobook
- `GET /api/audiobooks/:id` - Get specific audiobook
- `DELETE /api/audiobooks/:id` - Delete audiobook

## Development

To run in development mode with auto-restart:

```bash
npm run dev
```

## Future Enhancements

- Database integration for persistent storage
- User authentication and accounts
- Multiple voice options
- Audio file export
- Bookmarking and progress tracking
- Social sharing features

## License

MIT License - feel free to use and modify as needed! 