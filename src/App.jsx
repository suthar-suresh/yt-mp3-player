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

/* =======================
   CONFIG
======================= */
const API_URL = "http://localhost:5000";

/* =======================
   STATIC SONGS (PUBLIC)
======================= */
const staticSongLinks = [
  "https://www.youtube.com/watch?v=gkCKTuR-ECI",
  "https://www.youtube.com/watch?v=NbWKYgaWzbI",
  "https://www.youtube.com/watch?v=Umqb9KENgmk",
];

const YT_OEMBED = "https://www.youtube.com/oembed?format=json&url=";

const getYoutubeThumbnail = (url) => {
  try {
    const id = new URL(url).searchParams.get("v");
    return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  } catch {
    return "";
  }
};

/* =======================
   MAIN APP
======================= */
export default function App() {
  const playerRef = useRef(null);

  /* ---------- AUTH ---------- */
  const [token, setToken] = useState(localStorage.getItem("token"));

  const loginWithGoogle = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setApiSongs([]);
  };

  /* ---------- SONG STATES ---------- */
  const [staticSongs, setStaticSongs] = useState([]);
  const [apiSongs, setApiSongs] = useState([]);
  const [mode, setMode] = useState("static");

  /* ---------- PLAYER STATES ---------- */
  const [currentTrack, setCurrentTrack] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  /* =======================
     FETCH STATIC SONG DATA
  ======================= */
  useEffect(() => {
    Promise.all(
      staticSongLinks.map(async (link) => {
        try {
          const res = await fetch(`${YT_OEMBED}${encodeURIComponent(link)}`);
          const data = await res.json();
          return {
            name: data.title,
            artist: data.author_name,
            img: data.thumbnail_url,
            link,
          };
        } catch {
          return {
            name: "Unknown",
            artist: "YouTube",
            img: getYoutubeThumbnail(link),
            link,
          };
        }
      })
    ).then(setStaticSongs);
  }, []);

  /* =======================
     FETCH USER SONGS
  ======================= */
  useEffect(() => {
    if (!token) return;

    fetch(`${API_URL}/songs`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((r) => r.json())
      .then(setApiSongs)
      .catch(console.error);
  }, [token]);

  /* =======================
     SONG LIST SOURCE
  ======================= */
  const allTracks =
    mode === "static"
      ? staticSongs
      : apiSongs.map((s) => ({
          name: s.title,
          artist: s.artist,
          img: s.thumbnail,
          link: s.youtubeUrl,
        }));

  const track = allTracks[currentTrack] || {};

  /* =======================
     SAVE SONG (LOGIN ONLY)
  ======================= */
  const saveSong = async (link) => {
    if (!token) {
      alert("Login required to save songs");
      return;
    }

    await fetch(`${API_URL}/songs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        youtubeUrl: link,
        title: "Custom Song",
        artist: "YouTube",
        thumbnail: getYoutubeThumbnail(link),
      }),
    });

    const updated = await fetch(`${API_URL}/songs`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());

    setApiSongs(updated);
  };

  /* =======================
     PLAYER CONTROLS
  ======================= */
  const handlePlayPause = () => setPlaying((p) => !p);

  const handleNext = () => {
    if (isShuffle) {
      setCurrentTrack(Math.floor(Math.random() * allTracks.length));
    } else {
      setCurrentTrack((p) => (p + 1) % allTracks.length);
    }
    setPlayed(0);
    setPlaying(true);
  };

  const handlePrevious = () => {
    setCurrentTrack((p) => (p - 1 + allTracks.length) % allTracks.length);
    setPlayed(0);
    setPlaying(true);
  };

  const handleEnded = () => {
    if (isRepeat) {
      setPlaying(true);
    } else {
      handleNext();
    }
  };

  const formatTime = (sec) => {
    if (!sec) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  /* =======================
     UI
  ======================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center">
      <div className="w-[1100px] h-[680px] bg-white/20 backdrop-blur-xl rounded-3xl p-8 flex">

        {/* LEFT */}
        <div className="flex-1 pr-8">
          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <BsMusicNoteBeamed size={28} />
              <h1 className="text-2xl font-bold">Harmony</h1>
            </div>

            {!token ? (
              <button
                onClick={loginWithGoogle}
                className="bg-white text-black px-4 py-2 rounded-lg font-bold"
              >
                Login with Google
              </button>
            ) : (
              <button
                onClick={logout}
                className="bg-black/70 px-4 py-2 rounded-lg"
              >
                Logout
              </button>
            )}
          </div>

          {/* NOW PLAYING */}
          <div className="flex gap-6 mb-6">
            <img
              src={track.img}
              alt=""
              className="w-44 h-44 rounded-xl"
            />
            <div>
              <h2 className="text-2xl font-bold">{track.name}</h2>
              <p className="text-white/70">{track.artist}</p>
            </div>
          </div>

          {/* MODES */}
          <div className="flex gap-3 mb-4">
            <button onClick={() => setMode("static")}>Static</button>
            {token && <button onClick={() => setMode("user")}>My Songs</button>}
          </div>

          {/* CONTROLS */}
          <div className="flex items-center gap-6 mt-6">
            <button onClick={handlePrevious}><BsFillSkipBackwardFill /></button>
            <button onClick={handlePlayPause} className="text-4xl">
              {playing ? <BsFillPauseFill /> : <BsFillPlayFill />}
            </button>
            <button onClick={handleNext}><BsFillSkipForwardFill /></button>
            <button onClick={() => saveSong(track.link)}>
              <BsHeart />
            </button>
          </div>

          {/* PROGRESS */}
          <div className="mt-4">
            <span>{formatTime(played * duration)}</span>
            <span className="float-right">{formatTime(duration)}</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.001}
              value={played}
              onChange={(e) => {
                setPlayed(e.target.value);
                playerRef.current.seekTo(e.target.value);
              }}
              className="w-full"
            />
          </div>

          <ReactPlayer
            ref={playerRef}
            url={track.link}
            playing={playing}
            volume={volume}
            width="0"
            height="0"
            onProgress={({ played }) => setPlayed(played)}
            onDuration={setDuration}
            onEnded={handleEnded}
          />
        </div>

        {/* RIGHT PLAYLIST */}
        <div className="w-[300px] overflow-y-auto">
          {allTracks.map((t, i) => (
            <div
              key={i}
              onClick={() => {
                setCurrentTrack(i);
                setPlaying(true);
              }}
              className={`p-3 rounded-xl mb-2 cursor-pointer ${
                i === currentTrack ? "bg-pink-500" : "bg-black/30"
              }`}
            >
              {t.name}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
