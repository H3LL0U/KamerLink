import { client } from "./gen/clients";

type GambleTypes = "Slots";

export const gamble = client.path("/api/gamble").method("post").create()