import axios from "axios";

export const steadfastApi = axios.create({
    baseURL: "https://portal.packzy.com/api/v1",
    headers: {
        "Content-Type": "application/json",
        "Api-Key": process.env.STEADFAST_API_KEY,
        "Secret-Key": process.env.STEADFAST_SECRET_KEY,
    },
    timeout: 10000,
});
