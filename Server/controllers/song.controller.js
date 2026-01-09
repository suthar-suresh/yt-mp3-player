import Song from "../models/Song.js";

export const addSong = async (req, res) => {
  const song = await Song.create({
    ...req.body,
    userId: req.user.id,
    isGlobal: false
  });
  res.json(song);
};

export const addGlobalSong = async (req, res) => {
  const song = await Song.create({
    ...req.body,
    isGlobal: true
  });
  res.json(song);
};

export const getSongs = async (req, res) => {
  const { search } = req.query;

  const filter = {
    $or: [
      { userId: req.user.id },
      { isGlobal: true }
    ]
  };

  if (search) {
    filter.title = { $regex: search, $options: "i" };
  }

  const songs = await Song.find(filter).sort({ createdAt: -1 });
  res.json(songs);
};
