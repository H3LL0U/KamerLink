import { client } from "./gen/clients";



export const gamble = client.path("/api/gamble").method("post").create()