import React, { useRef, useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import './App.css';

function App() {
  const staticSongs = [
    { name: "Tum Hi Ho", link: "https://www.youtube.com/watch?v=Umqb9KENgmk" },
    { name: "Ranjhan", link: "https://www.youtube.com/watch?v=5AQ5Nz3WMlY" },
    { name: "Piya O Re Piya", link: "https://www.youtube.com/watch?v=u-FaTNxrWhw" },
    { name: "Channa Mereya", link: "https://www.youtube.com/watch?v=bzSTpdcs-EI" },
    { name: "Kudi Kon Nachdi", link: "https://www.youtube.com/watch?v=NbWKYgaWzbI" },
    { name: "Tum Ho", link: "https://www.youtube.com/watch?v=gkCKTuR-ECI" }
  ];

  const [mode, setMode] = useState("static"); // static, single, multiple
  const [singleLink, setSingleLink] = useState("");
  const [multiLinks, setMultiLinks] = useState([""]);
  const [customTracks, setCustomTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [played, setPlayed] = useState(0);

  const playerRef = useRef(null);

  const allTracks =
    mode === "static"
      ? staticSongs
      : mode === "single"
      ? [{ name: "Custom Song", link: singleLink }]
      : customTracks.map((link, i) => ({ name: `Track ${i + 1}`, link }));

  const handlePlayPause = () => setPlaying(!playing);
  const handleVolumeChange = (e) => setVolume(parseFloat(e.target.value));
  const handleSeek = (e) => {
    const seekTo = parseFloat(e.target.value);
    setPlayed(seekTo);
    playerRef.current.seekTo(seekTo);
  };
  const handleNext = () => {
    setCurrentTrack((prev) => (prev + 1) % allTracks.length);
    setPlayed(0);
    setPlaying(true);
  };
  const handlePrevious = () => {
    setCurrentTrack((prev) => (prev - 1 + allTracks.length) % allTracks.length);
    setPlayed(0);
    setPlaying(true);
  };
  const handleEnded = () => handleNext();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        handlePlayPause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playing]);

  return (
    <div className="p-4 bg-gray-100 text-black">
      {/* Mode Selectors */}
      <div className="flex gap-4 mb-4">
        {["static", "single", "multiple"].map((value) => (
          <label
            key={value}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border cursor-pointer transition
              ${mode === value ? "bg-purple-600 text-white" : "bg-white text-gray-800 hover:bg-purple-100"}`}
          >
            <input
              type="radio"
              value={value}
              checked={mode === value}
              onChange={() => setMode(value)}
              className="hidden"
            />
            {value === "static"
              ? "Static Songs"
              : value === "single"
              ? "Single Link"
              : "Multiple Links"}
          </label>
        ))}
      </div>

      {/* Input for Single Link */}
      {mode === "single" && (
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={singleLink}
            onChange={(e) => setSingleLink(e.target.value)}
            placeholder="Paste YouTube URL"
            className="border p-2 w-full rounded"
          />
          <button
            onClick={() => {
              setCurrentTrack(0);
              setPlaying(true);
            }}
            className="bg-purple-500 text-white px-4 py-2 rounded"
          >
            Play
          </button>
        </div>
      )}

      {/* Input for Multiple Links */}
      {mode === "multiple" && (
        <div className="flex flex-col gap-2 mb-4">
          {multiLinks.map((link, index) => (
            <input
              key={index}
              type="text"
              value={link}
              onChange={(e) => {
                const updated = [...multiLinks];
                updated[index] = e.target.value;
                setMultiLinks(updated);
              }}
              placeholder={`YouTube URL ${index + 1}`}
              className="border p-2 w-full rounded"
            />
          ))}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setMultiLinks([...multiLinks, ""])}
              className="bg-gray-300 px-3 py-2 rounded"
            >
              + Add More
            </button>
            <button
              onClick={() => {
                const filtered = multiLinks.filter((url) => url.trim() !== "");
                setCustomTracks(filtered);
                setCurrentTrack(0);
                setPlaying(true);
              }}
              className="bg-purple-500 text-white px-4 py-2 rounded"
            >
              Play All
            </button>
          </div>
        </div>
      )}

      {/* Player UI */}
      <div className="fixed bottom-0 left-0 w-full bg-white text-black z-50 group transition-all duration-500 ease-in-out">
        <input
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={played}
          onChange={handleSeek}
          className="w-full h-1 accent-purple-500 cursor-pointer absolute
            [&::-webkit-slider-thumb]:opacity-0
            group-hover:[&::-webkit-slider-thumb]:opacity-100
            transition-opacity duration-300"
        />

        <div className="sm:hidden flex flex-col items-center justify-center pt-2">
          <div className="text-sm font-semibold text-center truncate max-w-[200px]">
            {allTracks[currentTrack]?.name}
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-4">
          <div className="w-1/3 hidden sm:flex items-center gap-3 overflow-hidden">
            <img src="" alt="" className="w-10 h-10 object-cover rounded" />
            <div className="overflow-hidden">
              <div className="text-sm font-semibold text-black truncate">{allTracks[currentTrack]?.name}</div>
            </div>
          </div>

          <div className="w-full sm:w-1/3 flex justify-center items-center gap-6 text-xl">
            <button onClick={handlePrevious} className="hover:text-purple-400">
              <svg className="w-6 h-6 fill-current mx-auto" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6V6zm3.5 6 8.5 6V6l-8.5 6z" />
              </svg>
            </button>

            <button onClick={handlePlayPause} className="hover:text-purple-400">
              {playing ? (
                <svg className="w-8 h-8 fill-current mx-auto" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-8 h-8 fill-current mx-auto" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <button onClick={handleNext} className="hover:text-purple-400">
              <svg className="w-6 h-6 fill-current mx-auto" viewBox="0 0 24 24">
                <path d="M16 6h2v12h-2V6zm-3.5 6L4 18V6l8.5 6z" />
              </svg>
            </button>
          </div>

          <div className="w-1/3 justify-end items-center gap-2 text-sm hidden sm:flex">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-black hover:text-purple-400">
              <path d="M7 9v6h4l5 5V4l-5 5H7z" />
            </svg>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={handleVolumeChange}
              className="accent-black w-24 h-1 cursor-pointer"
            />
          </div>

          <ReactPlayer
            ref={playerRef}
            url={allTracks[currentTrack]?.link}
            playing={playing}
            controls={false}
            width="0"
            height="0"
            style={{ visibility: 'hidden' }}
            volume={volume}
            onEnded={handleEnded}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onProgress={({ played }) => setPlayed(played)}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
