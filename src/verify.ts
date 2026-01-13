export async function verifySession(authToken: string, fingerprint: string, redis: any){
  if (!authToken) {
    return { valid: false };
  }

  if (!fingerprint) {
    throw new Error('Error calculating fingerprint');
  }

  try {
    const originalFingerprint =  await redis.get(authToken);

    if (originalFingerprint == fingerprint || originalFingerprint == null) {
        return {
            receivedFingerprint: originalFingerprint,
            valid: true, 
            hijacked: false
          }
      }

    return {
      receivedFingerprint: originalFingerprint,
      valid: false,
      hijacked: true,
    };
  } catch (error) {
    return { valid: false };
  }
}