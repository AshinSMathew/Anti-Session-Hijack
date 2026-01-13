export async function verifySession(authTokenHash, fingerprint, redis) {
    if (!authTokenHash) {
        return { valid: false };
    }
    if (!fingerprint) {
        throw new Error('Error calculating fingerprint');
    }
    try {
        const originalFingerprint = await redis.get(authTokenHash);
        if (originalFingerprint == fingerprint) {
            return {
                receivedFingerprint: originalFingerprint,
                valid: true,
                hijacked: false
            };
        }
        return {
            receivedFingerprint: originalFingerprint,
            valid: false,
            hijacked: true,
        };
    }
    catch (error) {
        return { valid: false };
    }
}
