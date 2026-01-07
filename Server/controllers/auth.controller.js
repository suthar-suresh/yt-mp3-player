import jwt from "jsonwebtoken";

export const googleCallback = (req, res) => {
  const token = jwt.sign(
    { id: req.user._id, role: req.user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  // redirect to frontend
  res.redirect(`http://localhost:3000/auth-success?token=${token}`);
};
