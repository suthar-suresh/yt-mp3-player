import React, { useRef, useState, useEffect } from "react";
import ReactPlayer from "react-player";
import {
  BsFillPlayFill,
  BsFillPauseFill,
  BsFillSkipForwardFill,
  BsFillSkipBackwardFill,
  BsVolumeUpFill,
  BsShuffle,
  BsRepeat,
  BsHeart,
  BsMusicNoteBeamed,
} from "react-icons/bs";

// Only store links here!
const staticSongLinks = [
  "https://www.youtube.com/watch?v=gkCKTuR-ECI",
  "https://www.youtube.com/watch?v=NbWKYgaWzbI",
  "https://www.youtube.com/watch?v=Umqb9KENgmk",
  "https://www.youtube.com/watch?v=5AQ5Nz3WMlY",
  "https://www.youtube.com/watch?v=u-FaTNxrWhw",
  "https://www.youtube.com/watch?v=bzSTpdcs-EI",
];

const YT_OEMBED = "https://www.youtube.com/oembed?format=json&url=";

function getYoutubeThumbnail(url) {
  try {
    const id = new URL(url).searchParams.get("v");
    return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  } catch {
    return "";
  }
}

export default function App() {
  // Fetch oEmbed data for static songs
  const [staticSongs, setStaticSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all(
      staticSongLinks.map(async (link) => {
        try {
          const res = await fetch(`${YT_OEMBED}${encodeURIComponent(link)}`);
          if (!res.ok) throw new Error();
          const data = await res.json();
          return {
            name: data.title,
            artist: data.author_name,
            img: data.thumbnail_url,
            link,
          };
        } catch {
          // fallback if fetch fails
          return {
            name: "Unknown Title",
            artist: "Unknown Artist",
            img: getYoutubeThumbnail(link),
            link,
          };
        }
      })
    ).then((songs) => {
      if (isMounted) {
        setStaticSongs(songs);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  // --- Player state and logic ---
  const [mode, setMode] = useState("static");
  const [singleLink, setSingleLink] = useState("");
  const [multiLinks, setMultiLinks] = useState([""]);
  const [customTracks, setCustomTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  const playerRef = useRef(null);

  // Tracks to play based on mode
  const allTracks =
    mode === "static"
      ? staticSongs
      : mode === "single"
      ? singleLink
        ? [
            {
              name: "Custom Song",
              artist: "",
              img: getYoutubeThumbnail(singleLink),
              link: singleLink,
            },
          ]
        : []
      : customTracks.map((link, i) => ({
          name: `Track ${i + 1}`,
          artist: "",
          img: getYoutubeThumbnail(link),
          link,
        }));

  // Controls
  const handlePlayPause = () => setPlaying((p) => !p);
  const handleVolumeChange = (e) => setVolume(parseFloat(e.target.value));
  const handleSeek = (e) => {
    const seekTo = parseFloat(e.target.value);
    setPlayed(seekTo);
    playerRef.current.seekTo(seekTo);
  };
  const handleNext = () => {
    if (isShuffle) {
      let next;
      do {
        next = Math.floor(Math.random() * allTracks.length);
      } while (next === currentTrack && allTracks.length > 1);
      setCurrentTrack(next);
    } else {
      setCurrentTrack((prev) => (prev + 1) % allTracks.length);
    }
    setPlayed(0);
    setPlaying(true);
  };
  const handlePrevious = () => {
    setCurrentTrack((prev) => (prev - 1 + allTracks.length) % allTracks.length);
    setPlayed(0);
    setPlaying(true);
  };
  const handleEnded = () => {
    if (isRepeat) {
      setPlayed(0);
      setPlaying(true);
    } else {
      handleNext();
    }
  };

  // Keyboard shortcut for play/pause (space)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        handlePlayPause();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playing]);

  // Reset track when mode or playlist changes
  useEffect(() => {
    setCurrentTrack(0);
    setPlayed(0);
    setPlaying(false);
  }, [mode]);

  function formatTime(sec) {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  }

  // Handle loading state
  if (mode === "static" && loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-[#b983ff] via-[#8f71ff] to-[#6e61e7]">
        <div className="text-white text-2xl font-bold">Loading playlist...</div>
      </div>
    );
  }

  const track = allTracks[currentTrack] || {};

  // --- The main JSX ---
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-[#b983ff] via-[#8f71ff] to-[#6e61e7]">
      <div className="w-[1200px] h-[700px] rounded-[32px] bg-white/20 shadow-2xl backdrop-blur-2xl flex px-12 py-10 relative">
        {/* Left: Player */}
        <div className="flex-1 flex flex-col justify-between">
          {/* Header */}
          <div>
            <div className="flex items-center space-x-3 mb-10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c471f5] to-[#fa71cd] flex items-center justify-center">
                <BsMusicNoteBeamed className="text-white text-2xl" />
              </div>
              <span className="text-3xl font-extrabold bg-gradient-to-r from-[#c471f5] to-[#fa71cd] bg-clip-text text-transparent select-none">Harmony</span>
            </div>
            <div className="text-xl font-bold text-white mb-8">Now Playing</div>
            <div className="flex items-center space-x-7">
              {/* Album Art */}
              <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-[#fa71cd] bg-black/30 flex items-center justify-center">
                <img
                  src={track.img}
                  alt={track.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Song Info */}
              <div>
                <div className="text-3xl font-extrabold text-white mb-2">{track.name}</div>
                <div className="text-lg text-white/70 font-semibold mb-2">{track.artist}</div>
                {/* Animated waveform */}
                <div className="flex items-end space-x-1 h-6 pt-10">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 rounded bg-gradient-to-t from-[#fa71cd] to-[#c471f5] animate-bounce"
                      style={{
                        animationDelay: `${i * 0.11}s`,
                        height: `${8 + (i % 4) * 6 + 10}px`
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
            {/* Mode Buttons */}
            <div className="flex space-x-4 mt-10 mb-4">
              {["static", "single", "multiple"].map((m) => (
                <button
                  key={m}
                  className={`px-6 py-2 rounded-full font-semibold text-white transition ${
                    mode === m
                      ? "bg-gradient-to-r from-[#c471f5] to-[#fa71cd] shadow"
                      : "bg-black/70 shadow"
                  }`}
                  onClick={() => setMode(m)}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
            {/* Single Link Input */}
            {mode === "single" && (
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={singleLink}
                    onChange={(e) => setSingleLink(e.target.value)}
                    placeholder="Paste YouTube URL here"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                  />
                  <button
                    className="bg-gradient-to-tr from-fuchsia-500 to-indigo-500 hover:from-fuchsia-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg font-semibold shadow transition"
                    onClick={() => {
                      setCurrentTrack(0);
                      setPlaying(true);
                    }}
                  >
                    Play
                  </button>
                </div>
              </div>
            )}
            {/* Multiple Links Input */}
            {mode === "multiple" && (
              <div className="mb-6">
                <div className="space-y-2">
                  {multiLinks.map((link, idx) => (
                    <input
                      key={idx}
                      type="text"
                      placeholder={`YouTube URL ${idx + 1}`}
                      value={link}
                      onChange={(e) => {
                        const updated = [...multiLinks];
                        updated[idx] = e.target.value;
                        setMultiLinks(updated);
                      }}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                    />
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg font-semibold transition"
                    onClick={() => setMultiLinks([...multiLinks, ""])}
                  >
                    + Add More
                  </button>
                  <button
                    className="bg-gradient-to-tr from-fuchsia-500 to-indigo-500 hover:from-fuchsia-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg font-semibold shadow transition"
                    onClick={() => {
                      const filtered = multiLinks.filter((url) => url.trim() !== "");
                      setCustomTracks(filtered);
                      setCurrentTrack(0);
                      setPlaying(true);
                    }}
                  >
                    Play All
                  </button>
                </div>
              </div>
            )}
            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-xs text-white/80 mb-1">
                <span>{formatTime(played * duration)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div className="relative w-full h-2 rounded-full bg-white/30">
                <div
                  className="absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r from-[#fa71cd] to-[#c471f5]"
                  style={{ width: `${played * 100}%` }}
                ></div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.001}
                  value={played}
                  onChange={handleSeek}
                  className="seek-slider absolute w-full h-2 bg-transparent"
                  style={{ zIndex: 2, top: 0, left: 0 }}
                />
              </div>
            </div>
            {/* Controls */}
            <div className="flex items-center justify-center space-x-8 mt-10">
              <button
                onClick={() => setIsShuffle((prev) => !prev)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                  isShuffle ? "bg-fuchsia-600/80" : "bg-black/70 hover:bg-fuchsia-500/30"
                }`}
                title="Shuffle"
              >
                <BsShuffle className={isShuffle ? "text-white" : "text-fuchsia-200"} size={22} />
              </button>
              <button
                onClick={handlePrevious}
                className="w-12 h-12 rounded-full bg-black/70 flex items-center justify-center text-white text-2xl shadow-lg hover:bg-[#c471f5] transition"
              >
                <BsFillSkipBackwardFill />
              </button>
              <button
                onClick={handlePlayPause}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#fa71cd] to-[#c471f5] flex items-center justify-center text-white text-4xl shadow-lg hover:scale-110 transition"
              >
                {playing ? <BsFillPauseFill /> : <BsFillPlayFill />}
              </button>
              <button
                onClick={handleNext}
                className="w-12 h-12 rounded-full bg-black/70 flex items-center justify-center text-white text-2xl shadow-lg hover:bg-[#c471f5] transition"
              >
                <BsFillSkipForwardFill />
              </button>
              <button
                onClick={() => setIsRepeat((prev) => !prev)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                  isRepeat ? "bg-fuchsia-600/80" : "bg-black/70 hover:bg-fuchsia-500/30"
                }`}
                title="Repeat"
              >
                <BsRepeat className={isRepeat ? "text-white" : "text-fuchsia-200"} size={22} />
              </button>
              {/* Volume */}
              <div className="flex items-center space-x-2 ml-4">
                <BsVolumeUpFill className="text-fuchsia-200" />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={handleVolumeChange}
                  className="accent-fuchsia-500 w-24 h-2 rounded-full bg-gray-300"
                />
              </div>
              <button className="w-10 h-10 rounded-full flex items-center justify-center transition bg-black/70 hover:bg-fuchsia-500/30" title="Like">
                <BsHeart className="text-fuchsia-200" size={22} />
              </button>
            </div>
            {/* ReactPlayer (hidden) */}
            <ReactPlayer
              ref={playerRef}
              url={track.link}
              playing={playing}
              controls={false}
              width="0"
              height="0"
              style={{ visibility: "hidden" }}
              volume={volume}
              onEnded={handleEnded}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onProgress={({ played }) => setPlayed(played)}
              onDuration={(d) => setDuration(d)}
            />
          </div>
        </div>
        {/* Right: Playlist */}
        <div className="w-[320px] pl-10 flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-white text-lg">Playlist</span>
            <button className="text-[#fa71cd] text-xs font-bold">View All</button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            {allTracks.map((track, idx) => (
              <div
                key={track.link}
                onClick={() => {
                  setCurrentTrack(idx);
                  setPlaying(true);
                }}
                className={`rounded-xl flex items-center space-x-3 p-3 mb-2 shadow-lg transition cursor-pointer ${
                  idx === currentTrack
                    ? "bg-gradient-to-r from-[#fa71cd] to-[#c471f5]"
                    : "bg-black/30 hover:bg-[#c471f5]/30"
                }`}
              >
                <img src={track.img} alt={track.name} className="w-12 h-12 rounded-lg" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white truncate">{track.name}</div>
                  <div className="text-xs text-white/70 truncate">{track.artist}</div>
                </div>
                <BsFillPlayFill className="text-white text-xl" />
              </div>
            ))}
          </div>
        </div>
        {/* Custom scrollbar style */}
        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #fa71cd 10%, #c471f5 90%);
            border-radius: 8px;
          }
          .custom-scrollbar {
            scrollbar-color: #fa71cd #232323;
            scrollbar-width: thin;
          }
        `}</style>
      </div>
    </div>
  );
}
