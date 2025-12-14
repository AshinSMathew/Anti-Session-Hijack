import { post } from "../lib/http";

export async function signup(
  name: string,
  email: string,
  password: string
) {
  return post("/signup", {
    name,
    email,
    password
  });
}