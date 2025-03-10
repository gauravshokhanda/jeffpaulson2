import axios from "axios";

const baseUrl = "https://g32.iamdeveloper.in/public/";

const API = axios.create({
    baseURL: "https://g32.iamdeveloper.in/api/",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});
export { API, baseUrl };