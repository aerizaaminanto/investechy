import bcrypt from "bcryptjs";

export const hash = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const compare = (password, hashedPassword) => {
  if (!password || !hashedPassword) {
    return false;
  }

  const isMatch = bcrypt.compareSync(password, hashedPassword);
  return isMatch;
};
