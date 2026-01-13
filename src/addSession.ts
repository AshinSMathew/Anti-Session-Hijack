export async function addSession( authTokenHash:string, fingerprint:string, redis: any){
    try{
        await redis.set(authTokenHash, fingerprint);
    }catch(error){
        console.log(error);
    }
}