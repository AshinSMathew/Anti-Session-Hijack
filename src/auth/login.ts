import { post } from "../lib/http";
import { getFingerprint } from "../fingerprint/getFingerprint";

export async function login(
  email: string,
  password: string
) {
  const fingerprint = await getFingerprint();

  return post("/login", {
    email,
    password,
    fingerprint
  });
}