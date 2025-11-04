import redisClient from "../config/redisClient";
export async function saveMessageToCache(roomId: string, message: string){
    const key = `chat:${roomId}`;
    await redisClient.lPush(key,message); // push new messages to list
    await redisClient.lTrim(key, 0, 49); // keep only latest 50

}

export async function getRecentMessages(roomId:string) {
    const key = `chat:${roomId}`;
    return await redisClient.lRange(key,0,49); // get latest 50
    
}