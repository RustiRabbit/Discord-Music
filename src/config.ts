import * as dotenv from "dotenv";
dotenv.config();

const CONFIG = {
    TOKEN: process.env.TOKEN as string // Discord Token
};

export default CONFIG;