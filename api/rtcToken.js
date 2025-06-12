import { RtcTokenBuilder, RtcRole } from "agora-access-token";

const APP_ID = "ee03e22442db40789c1a641eae358a68";
const APP_CERTIFICATE = "82e1759b7d294712b4788443a6e4cec6";

export default function handler(req, res) {
  // Set CORS headers for all requests
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  const channelName = req.query.channelName;

  // Return error with CORS headers set too
  if (!channelName) {
    return res.status(400).json({ error: "channelName is required" });
  }

  const uid = 0;
  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpireTs = currentTimestamp + expirationTimeInSeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    role,
    privilegeExpireTs
  );

  return res.status(200).json({ token });
}
