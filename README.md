# TK_MusicPlayer
TK's online music player

1. Overview and Design Concept 
The TK-100 is a web-based music player designed to look and feel like a high-end, vintage piece of audio hardware (inspired by classic industrial Braun design). It connects directly to your Dropbox account, treating your cloud music folders like physical compact discs.

It features:
- A dark, brushed-metal chassis look.
- An amber OLED display screen showing track numbers, timers, and song titles.
- A central optical disc bay where a virtual CD spins while music plays.
- Physical-style tactile buttons for transport controls.

2. Connecting to Your Music Library
- Dropbox Authentication: When you first open the app, it prompts you for a Dropbox access token. This token is securely saved right inside your browser's local storage so you don't have to log in every time.
- Folder Browsing: The app reads your cloud folders. Folders are listed first, followed by audio files and cover art. You can drill down into sub-folders to find your music.
- Supported Formats: It handles common audio files like MP3, FLAC, M4A, AAC, WAV, and OGG.

3. Album Art and Thumbnails
The player automatically searches for album artwork to display on both the library list and the spinning CD in two ways:

- Standalone Image Files: It first checks the folder for image files like cover.jpg or folder.jpg.
- Embedded ID3 Tags: If no separate image file is found, it automatically checks inside the audio files themselves (using a tool called jsmediatags) to extract embedded album artwork on-the-fly.
- Clean List Design: As soon as a thumbnail image is successfully loaded for a folder or track, the default bullet point or folder icon disappears automatically, leaving a clean view with just the thumbnail and the title.

4. CD Tray Mechanics and Animations
The player simulates a mechanical CD player tray with realistic physics and animations:
- Inserting a CD: When you select a new music folder to play, the virtual CD performs a smooth slide-in animation from the side into the optical well, accompanied by a status message ("CD Loaded").
- Ejecting a CD: When you hit the Eject button, the CD slides out of view, stops spinning, clears the audio stream, and resets the library back to the root folder.
- Smart Track Switching (Same Album): If you are already listening to an album and click a different song within that same album (either using the Next/Prev buttons or by clicking directly on the song list), no tray animation happens. The music switches instantly and seamlessly without ejecting or re-inserting the CD.
- Animation Lock: To prevent glitches if you click around too fast, a built-in safety lock temporarily ignores extra clicks while a tray animation is actively running.

5. Playback and Audio Controls
The transport bar gives you full control over your music:
- Play / Pause (PP): Starts or pauses the audio. When paused, the CD stops spinning; when playing, it starts a smooth 60 frames-per-second rotation loop.
- Next & Previous: Skips tracks. If a track has been playing for more than 3 seconds, pressing "Previous" restarts the current track; pressing it again goes to the previous track.
- Stop: Halts playback, resets the timer to zero, and stops the CD from spinning.
- Shuffle: Randomizes track playback within the loaded album so you don't hear the same order twice.
- Precision Scrubber: A range slider that lets you drag forward or backward to jump to any part of the song, with real-time gradient filling.
- Smart Session Guard: If you click rapidly between different songs, the player uses a session ID tracker to automatically cancel older, slower network requests. This ensures the song playing in your headphones always matches the text on the OLED screen.

6. Advanced Features
- TV Mode: Clicking the "TV Mode" button strips away all the library menus, buttons, and extra text. It leaves only a minimalist, distraction-free view of the spinning CD player—perfect for leaving on a screen while listening to music.
- Device Media Keys Integration: The player hooks into your operating system or mobile device's built-in media controls (navigator.mediaSession). This means you can use your keyboard or lock screen media buttons to play, pause, or skip tracks, complete with lock-screen track titles and album art.
