import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const { ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET } = process.env;

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = jwt.sign(
        {
          email: ADMIN_EMAIL,
          role: "admin",
        },
        JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );
      if (!token)
        throw {
          errorStatus: 500,
          message: "An error was ocurred login the user.",
        };
      res.status(200).json({ authToken: token, message: "User authorized." });
    } else {
      throw { errorStatus: 401, message: "Email or password incorrect." };
    }
  } catch (error) {
    res
      .status(error.errorStatus || 500)
      .json({ message: error.message || "Error logging in user" });
  }
};
