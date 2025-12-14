const BASE_URL = "https://session-hijacking.vercel.app";
export async function post(path, body) {
    const res = await fetch(`${BASE_URL}/api${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) {
        throw new Error(await res.text());
    }
    return res.json();
}
