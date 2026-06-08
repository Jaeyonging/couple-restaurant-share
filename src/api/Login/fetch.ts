import axios from "axios";
import { API_URL } from "../../types/types";

export const PostKakaoLogin = async (code: string) => {
    const response = await axios.post(`${API_URL}/api/auth/kakaoLogin`, {
        code,
    });
    return response.data;
};

export const PostNaverLogin = async (code: string, state: string) => {
    const response = await axios.post(`${API_URL}/api/auth/naverLogin`, {
        code,
        state,
    });
    return response.data;
};
