import { post } from "../lib/http";
import { getFingerprint } from "../fingerprint/getFingerprint";

export async function verifySession() {
  const fingerprint = await getFingerprint();

  return post("/verify", {
    fingerprint
  });
}