import { post } from "../lib/http";
export async function signup(name, email, password) {
    return post("/signup", {
        name,
        email,
        password
    });
}
