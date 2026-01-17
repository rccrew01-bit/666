# LiveKit Setup Guide

This guide will help you set up LiveKit for this video chat application.

## Quick Start (Development)

### Option 1: Using LiveKit Cloud (Easiest)

1. Sign up for a free account at [LiveKit Cloud](https://cloud.livekit.io/)
2. Create a project and get your API credentials
3. Create a `.env` file in the project root:
```bash
LIVEKIT_API_KEY=your_api_key_here
LIVEKIT_API_SECRET=your_api_secret_here
LIVEKIT_URL=wss://your-project.livekit.cloud
```
4. Start the server: `npm start`
5. Open http://localhost:3000 in your browser

### Option 2: Local LiveKit Server (Development)

1. Install LiveKit server:

**On Mac/Linux:**
```bash
curl -sSL https://get.livekit.io | bash
```

**On Mac with Homebrew:**
```bash
brew install livekit
```

**On Windows:**
Download from [LiveKit Releases](https://github.com/livekit/livekit/releases)

2. Run LiveKit server in dev mode:
```bash
livekit-server --dev
```

This starts LiveKit on `ws://localhost:7880` with default credentials:
- API Key: `devkey`
- API Secret: `secret`

3. Start this application:
```bash
npm start
```

4. Open http://localhost:3000 in multiple browser windows/tabs to test

## Testing Multi-User Video Chat

1. Open http://localhost:3000 in your browser
2. Enter a room name (e.g., "test-room")
3. Enter your name
4. Click "Join Room"
5. Grant camera and microphone permissions
6. Open http://localhost:3000 in another browser window or on another device
7. Use the same room name to join

## Features to Test

- ✅ Video streaming
- ✅ Audio streaming
- ✅ Multiple participants
- ✅ Toggle video on/off
- ✅ Toggle audio on/off
- ✅ Screen sharing
- ✅ Participant list

## Docker Setup (Optional)

You can also run LiveKit using Docker:

```bash
docker run --rm -p 7880:7880 \
    -p 7881:7881 \
    -p 7882:7882/udp \
    -e LIVEKIT_KEYS="devkey: secret" \
    livekit/livekit-server \
    --dev
```

## Production Deployment

For production:

1. Deploy LiveKit server using:
   - [LiveKit Cloud](https://cloud.livekit.io/) (recommended)
   - Self-hosted with Docker/Kubernetes
   - Cloud providers (AWS, GCP, DigitalOcean)

2. Update environment variables with production credentials

3. Use HTTPS/WSS for secure connections

4. Consider using a load balancer for scaling

## Troubleshooting

### "Failed to connect" error
- Ensure LiveKit server is running
- Check that WebSocket port (7880) is accessible
- Verify LIVEKIT_URL is correct

### Camera/microphone not working
- Check browser permissions
- Use HTTPS in production (required for media access)
- Ensure devices are not in use by another app

### Token generation fails
- Verify LIVEKIT_API_KEY and LIVEKIT_API_SECRET match your server
- Check server logs for detailed errors

## Resources

- [LiveKit Documentation](https://docs.livekit.io/)
- [LiveKit Server Setup](https://docs.livekit.io/transport/self-hosting/)
- [LiveKit Examples](https://github.com/livekit-examples)
- [LiveKit SDKs](https://docs.livekit.io/sdks/)
