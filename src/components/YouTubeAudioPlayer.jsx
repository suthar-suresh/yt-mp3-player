import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactPlayer from 'react-player';
import axios from 'axios';
import './AudioPlayer.css'; // Custom CSS for controls

const YouTubeAudioPlayer = () => {
  // Video URLs array
  const videoUrls = [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Example URLs
    'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    'https://www.youtube.com/watch?v=9bZkp7q19f0'
  ];

  const playerRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0); // Track current video index
  const [videoDetails, setVideoDetails] = useState({ title: '', thumbnail: '' }); // Video details

  // Fetch YouTube video details (Title & Thumbnail)
  const fetchVideoDetails = async (url) => {
    const videoId = url.split('v=')[1]; // Extract video ID from the URL

    try {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.REACT_APP_YOUTUBE_API_KEY}`
      );

      const { title, thumbnails } = response.data.items[0].snippet;
      setVideoDetails({
        title,
        thumbnail: thumbnails.high.url
      });
    } catch (error) {
      console.error('Error fetching video details', error);
    }
  };

  // Toggle play/pause
  const handlePlayPause = () => {
    setPlaying((prev) => !prev);
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  // Handle seeking
  const handleSeek = (e) => {
    const newPlayed = parseFloat(e.target.value);
    setPlayed(newPlayed);
    playerRef.current.seekTo(newPlayed);
  };

  // Track progress of the video/audio
  const handleProgress = useCallback(
    ({ played }) => {
      setPlayed(played);
    },
    []
  );

  // Handle duration change
  const handleDuration = (dur) => {
    setDuration(dur);
  };

  // Handle next video in the array
  const handleNext = () => {
    const nextIndex = (currentVideoIndex + 1) % videoUrls.length;
    setCurrentVideoIndex(nextIndex);
  };

  // Fetch details when the component mounts or when the video changes
  useEffect(() => {
    fetchVideoDetails(videoUrls[currentVideoIndex]);
  }, [currentVideoIndex]);

  return (
    <div className="page-container">
      {/* ReactPlayer to load YouTube video as audio */}
      <ReactPlayer
        ref={playerRef}
        url={videoUrls[currentVideoIndex]} // Change video based on index
        playing={playing} // Control play/pause
        controls={false} // Disable default controls
        width="0" // Hide the video
        height="0" // Hide the video
        style={{ visibility: 'hidden' }} // Hide player
        volume={volume}
        onPlay={() => setPlaying(true)} // On Play event
        onPause={() => setPlaying(false)} // On Pause event
        onProgress={handleProgress} // Track progress for seek bar
        onDuration={handleDuration} // Get the duration of the audio
      />

      {/* Video Thumbnail and Title */}
      <div className="video-info">
        <img src={videoDetails.thumbnail} alt="Video Thumbnail" className="thumbnail" />
        <h3>{videoDetails.title}</h3>
      </div>

      {/* Main content of the page */}
      <div className="content">
        <h1>Your Page Content</h1>
        <p>Here is some other content of the page...</p>
      </div>

      {/* Custom audio controls at bottom */}
      <div className="audio-player-container">
        <div className="controls">
          {/* Play/Pause Button */}
          <button onClick={handlePlayPause} className="play-pause-btn">
            {playing ? 'Pause' : 'Play'}
          </button>

          {/* Progress Bar */}
          <input
            type="range"
            min="0"
            max={duration}
            value={played * duration}
            onChange={handleSeek}
            className="progress-bar"
          />

          {/* Volume Control */}
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-bar"
          />

          {/* Next Button */}
          <button onClick={handleNext} className="next-btn">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default YouTubeAudioPlayer;
