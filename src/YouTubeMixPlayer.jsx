import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef
} from 'react';

const YouTubeMixPlayer = forwardRef(({ videoId, listId, playing, volume }, ref) => {
  const playerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    play: () => playerRef.current?.playVideo(),
    pause: () => playerRef.current?.pauseVideo(),
    next: () => playerRef.current?.nextVideo(),
    previous: () => playerRef.current?.previousVideo(),
    setVolume: (v) => playerRef.current?.setVolume(v * 100),
  }));

  useEffect(() => {
    const loadPlayer = () => {
      playerRef.current = new window.YT.Player('yt-mix-player', {
        height: '0',
        width: '0',
        videoId,
        playerVars: {
          autoplay: playing ? 1 : 0,
          listType: 'playlist',
          list: listId,
          start_radio: 1,
        },
        events: {
          onReady: (e) => {
            if (playing) e.target.playVideo();
            e.target.setVolume(volume * 100);
          },
        },
      });
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      window.onYouTubeIframeAPIReady = loadPlayer;
      document.body.appendChild(tag);
    } else {
      loadPlayer();
    }

    return () => {
      playerRef.current?.destroy?.();
    };
  }, [videoId, listId, playing, volume]);

  return <div id="yt-mix-player"></div>;
});

export default YouTubeMixPlayer;
