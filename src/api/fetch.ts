import axios from "axios";
import { NAVER_CLIENT_KEY, NAVER_CLIENT_SECRET } from "../types/types";


export const fetchNaverSearch = async (keyword: string) => {
    const response = await axios.get(`/api/v1/search/local.json?query=${keyword}&display=10&sort=sim`, {
        headers: {
            'X-Naver-Client-Id': NAVER_CLIENT_KEY,
            'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
        },
    });

    return response.data;
};