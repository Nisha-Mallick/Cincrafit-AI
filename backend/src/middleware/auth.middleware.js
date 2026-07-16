import admin from "../firebase.js";

const verifyAuthToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

 
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    
    const decodedToken = await admin.auth().verifyIdToken(token);

    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

export default verifyAuthToken;
