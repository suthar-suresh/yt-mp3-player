import React from 'react';
import YouTube from 'react-youtube';

const YouTubePlayer = ({ videoId }) => {
  const opts = {
    height: '90', // Small but visible enough
    width: '160',
    playerVars: {
      autoplay: 1,
      controls: 1,
      modestbranding: 1,
      rel: 0,
    },
  };

  const onReady = (event) => {
    // Access to player in all event handlers via event.target
    event.target.playVideo();
  };

  return <YouTube videoId={videoId} opts={opts} onReady={onReady} />;
};

export default YouTubePlayer;
