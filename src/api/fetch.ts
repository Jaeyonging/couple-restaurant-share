import axios from "axios";
import { NAVER_CLIENT_KEY, NAVER_CLIENT_SECRET } from "../types/types";


const fetchNaverSearch = async (keyword: string) => {
    const response = await axios.get(`/api/v1/search/local.json?query=${keyword}&display=10&start=1&sort=random`, {
        headers: {
            'X-Naver-Client-Id': NAVER_CLIENT_KEY,
            'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
        },
    });

    return response.data;
};

const fetchNaverImage = async (keyword: string, address:string) => {
    const response = await axios.get(`/api/v1/search/image.json?query=${keyword}+${address}&display=10&sort=sim`, {
        headers: {
            'X-Naver-Client-Id': NAVER_CLIENT_KEY,
            'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
        },
    });

    return response.data;
};


export const fetchNaverSearchWithImage = async (keyword: string) => {
    const searchRes = await fetchNaverSearch(keyword);
    const items = searchRes.items;

    const itemsWithImage = await Promise.all(
        items.map(async (item: any) => {
            const cleanTitle = item.title.replace(/<[^>]*>/g, "");
            const address = item.roadAddress.split(" ")[0];
            const imgRes = await fetchNaverImage(cleanTitle, address);

            return {
                ...item,
                thumbnail: imgRes.items?.[0]?.thumbnail ?? null, 
            };
        })
    );

    return { ...searchRes.data, items: itemsWithImage };
};
