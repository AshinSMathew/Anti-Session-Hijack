export declare function verifySession(authTokenHash: string, fingerprint: string, redis: any): Promise<{
    valid: boolean;
    receivedFingerprint?: undefined;
    hijacked?: undefined;
} | {
    receivedFingerprint: any;
    valid: boolean;
    hijacked: boolean;
}>;
