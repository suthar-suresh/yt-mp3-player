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

/* 🔴 ADDED */
const API_URL = "http://localhost:5000";

// Only store links here!
const staticSongLinks = [
  "https://www.youtube.com/watch?v=gkCKTuR-ECI",
  "https://www.youtube.com/watch?v=NbWKYgaWzbI",
  "https://www.youtube.com/watch?v=Umqb9KENgmk",
  "https://youtu.be/YyepU5ztLf4?si=v9C4TAdtGROiYVsL",
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
  /* ================= AUTH (ADDED) ================= */
  const [token, setToken] = useState(localStorage.getItem("token"));

  const loginWithGoogle = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setCustomTracks([]);
    setMode("static");
  };

  // handle ?token= from backend redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const jwt = params.get("token");
    if (jwt) {
      localStorage.setItem("token", jwt);
      setToken(jwt);
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  /* ================= STATIC SONGS ================= */
  const [staticSongs, setStaticSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
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
    return () => {
      isMounted = false;
    };
  }, []);

  /* ================= PLAYER STATE (OLD) ================= */
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

  /* ================= FETCH USER SONGS (ADDED + FIX) ================= */
  useEffect(() => {
    if (!token) return;

    fetch(`${API_URL}/songs`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((songs) => {
        const links = songs.map((s) => s.youtubeUrl);
        setCustomTracks(links);

        // 🔑 THIS WAS THE MISSING PART
        if (links.length > 0) {
          setMode("multiple");
        }
      })
      .catch(console.error);
  }, [token]);

  /* ================= TRACK SOURCE (OLD) ================= */
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

  /* ================= CONTROLS (OLD) ================= */
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

  /* ================= SAVE SONG (ADDED) ================= */
  const saveSongToBackend = async (link) => {
    if (!token) {
      alert("Please login with Google to save songs");
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
  };

  /* ================= UI (UNCHANGED) ================= */
  if (mode === "static" && loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-[#b983ff] via-[#8f71ff] to-[#6e61e7]">
        <div className="text-white text-2xl font-bold">Loading playlist...</div>
      </div>
    );
  }

  const track = allTracks[currentTrack] || {};

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-[#b983ff] via-[#8f71ff] to-[#6e61e7]">
      <div className="w-[1200px] h-[700px] rounded-[32px] bg-white/20 shadow-2xl backdrop-blur-2xl flex px-12 py-10 relative">
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c471f5] to-[#fa71cd] flex items-center justify-center">
                <BsMusicNoteBeamed className="text-white text-2xl" />
              </div>
              <span className="text-3xl font-extrabold bg-gradient-to-r from-[#c471f5] to-[#fa71cd] bg-clip-text text-transparent select-none">
                Harmony
              </span>

              {/* 🔴 LOGIN / LOGOUT (STYLE MATCHED) */}
              <div className="ml-auto">
                {!token ? (
                  <button
                    onClick={loginWithGoogle}
                    className="px-4 py-1 rounded-full bg-black/70 text-white text-sm font-semibold hover:bg-fuchsia-500/30"
                  >
                    Login with Google
                  </button>
                ) : (
                  <button
                    onClick={logout}
                    className="px-4 py-1 rounded-full bg-black/70 text-white text-sm font-semibold hover:bg-red-500/30"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
                
            {/* ❤️ ONLY onClick added */}
            <button
              onClick={() => saveSongToBackend(track.link)}
              className="w-10 h-10 rounded-full flex items-center justify-center transition bg-black/70 hover:bg-fuchsia-500/30"
              title="Save Song"
            >
              <BsHeart className="text-fuchsia-200" size={22} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
