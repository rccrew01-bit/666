# LiveKit Video Chat Application

A real-time video chat application powered by LiveKit and Node.js/Express.

## Features

- 🎥 Real-time video and audio communication
- 🖥️ Screen sharing capability
- 👥 Multiple participants support
- 📱 Responsive design for mobile and desktop
- 🔐 JWT-based authentication
- 🎨 Modern, user-friendly interface

## Prerequisites

- Node.js (v14 or higher)
- LiveKit Server (for production use)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables (optional):
```bash
# Create a .env file or set these in your environment
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
LIVEKIT_URL=wss://your-livekit-server.com
```

For development, the app uses default credentials that work with LiveKit's dev mode.

## Running the Application

### Development Mode (with LiveKit dev server)

1. Install and run LiveKit server in dev mode:
```bash
# Install LiveKit (Mac/Linux)
curl -sSL https://get.livekit.io | bash

# Or with Homebrew
brew install livekit

# Run in dev mode
livekit-server --dev
```

2. Start the Node.js server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

### Production Mode

1. Set up a LiveKit server (see [LiveKit Self-Hosting Guide](https://docs.livekit.io/transport/self-hosting/))

2. Configure environment variables with your production LiveKit server details

3. Run the application:
```bash
npm start
```

## Usage

1. Enter a room name and your name
2. Click "Join Room" to enter the video chat
3. Use the controls to toggle video/audio or share your screen
4. Share the room name with others to invite them

## API Endpoints

### LiveKit Endpoints

- `POST /api/token` - Generate access token for room
  - Body: `{ roomName: string, userName: string }`
  - Returns: `{ token: string, url: string, roomName: string, userName: string }`

- `GET /api/rooms` - Get room information

### Legacy Endpoints

- `POST /visit` - Log visitor information
- `POST /collect` - Collect player geolocation data
- `GET /qr?url=<url>` - Generate QR code for URL

## Project Structure

```
├── server.js           # Express server with LiveKit integration
├── package.json        # Dependencies and scripts
├── public/
│   ├── index.html     # Main HTML page
│   ├── style.css      # Styling
│   └── app.js         # LiveKit client logic
└── README.md          # This file
```

## Technologies Used

- **Backend**: Node.js, Express, Socket.io
- **Frontend**: HTML5, CSS3, JavaScript
- **Real-time Communication**: LiveKit
- **Additional**: QR Code generation, CORS support

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `LIVEKIT_API_KEY` | LiveKit API Key | `devkey` |
| `LIVEKIT_API_SECRET` | LiveKit API Secret | `secret` |
| `LIVEKIT_URL` | LiveKit Server URL | `ws://localhost:7880` |

## Troubleshooting

### Cannot connect to LiveKit server
- Ensure LiveKit server is running
- Check that the `LIVEKIT_URL` is correct
- Verify firewall settings allow WebSocket connections

### Video/audio not working
- Grant browser permissions for camera and microphone
- Check that your devices are not being used by another application

### Token generation fails
- Verify `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` match your LiveKit server configuration

## Resources

- [LiveKit Documentation](https://docs.livekit.io/)
- [LiveKit Examples](https://github.com/livekit-examples)
- [LiveKit Server SDK](https://github.com/livekit/server-sdk-js)

## License

ISC

