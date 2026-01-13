export async function addSession(authTokenHash, fingerprint, redis) {
    try {
        await redis.set(authTokenHash, fingerprint);
    }
    catch (error) {
        console.log(error);
    }
}
