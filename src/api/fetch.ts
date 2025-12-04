import axios from "axios";
import { API_URL, NAVER_CLIENT_KEY, NAVER_CLIENT_SECRET } from "../types/types";

export const fetchNaverSearchWithImage = async (keyword: string) => {
    const response = await axios.get(`${API_URL}/api/naver/searchPlace`, {
        params: { keyword }
    });
    return response.data;
};