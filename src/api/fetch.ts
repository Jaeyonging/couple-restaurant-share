import axios from "axios";
import { API_URL } from "../types/types";

export const fetchNaverSearchWithImage = async (keyword: string, page: number = 1) => {
    const response = await axios.get(`${API_URL}/api/naver/searchPlace`, {
        params: { keyword, page }
    });
    return response.data;
};

// 단건 이미지 lazy load용 — in-memory 캐시로 중복 요청 방지
const thumbnailCache = new Map<string, string | null>();

export const fetchPlaceThumbnail = async (keyword: string, address: string): Promise<string | null> => {
    const key = `${keyword}|${address}`;
    if (thumbnailCache.has(key)) return thumbnailCache.get(key)!;

    try {
        const response = await axios.get(`${API_URL}/api/naver/image`, {
            params: { keyword, address }
        });
        const thumbnail = response.data.thumbnail ?? null;
        thumbnailCache.set(key, thumbnail);
        return thumbnail;
    } catch {
        thumbnailCache.set(key, null);
        return null;
    }
};

// 장소 등록
export const registerPlace = async (placeData: any) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/place/register`, placeData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

// 즐겨찾기 등록
export const addFavPlace = async (placeId: number) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/favplace/add`, 
        { placeId },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    return response.data;
};

// 즐겨찾기 목록 조회
export const getFavPlaces = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/favplace/list`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

// 커플 정보 조회
export const getCoupleInfo = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/couple/info`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

// 초대코드로 커플 연결
export const joinCouple = async (inviteCode: string, meetDay?: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/couple/join`, 
        { inviteCode, meetDay },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    return response.data;
};

// 만난 날짜 수정
export const updateMeetDay = async (meetDay: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/couple/meetDay`,
        { meetDay },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    return response.data;
};

// 커플 생성
export const createCouple = async (meetDay?: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/couple/create`, 
        { meetDay },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    return response.data;
};

// 이메일 로그인
export const emailLogin = async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/api/auth/emailLogin`, {
        email,
        password
    });
    return response.data;
};

// 이메일 회원가입
export const emailRegister = async (email: string, password: string, nickname: string) => {
    const response = await axios.post(`${API_URL}/api/auth/emailRegister`, {
        email,
        password,
        nickname
    });
    return response.data;
};

// 리뷰 평점 작성/수정
export const submitRating = async (favPlaceId: number, star: number) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/review/rating`, 
        { favPlaceId, star },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    return response.data;
};

// 리뷰 평점 조회
export const getRatings = async (favPlaceId: number) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/review/rating/${favPlaceId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

// 코멘트 작성
export const submitComment = async (favPlaceId: number, comment: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/review/comment`, 
        { favPlaceId, comment },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    return response.data;
};

// 코멘트 목록 조회
export const getComments = async (favPlaceId: number) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/review/comment/${favPlaceId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

// 프로필 사진 업로드
export const updateProfileImage = async (imgUrl: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/auth/profileImage`,
        { imgUrl },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    return response.data;
};

// 즐겨찾기 삭제
export const deleteFavPlace = async (favPlaceId: number) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/favplace/delete/${favPlaceId}`, {}, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

// 댓글 수정
export const updateComment = async (commentId: number, comment: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/review/comment/update/${commentId}`,
        { comment },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

// 방문 날짜 취소
export const clearVisitDate = async (favPlaceId: number) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/favplace/visit/clear`,
        { favPlaceId },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

// 방문 날짜 추가/수정
export const updateVisitDate = async (favPlaceId: number, visitedAt: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/favplace/visit`, 
        { favPlaceId, visitedAt },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    return response.data;
};

// 커플 연결 끊기
export const disconnectCouple = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/couple/disconnect`, {}, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

// 닉네임 변경
export const updateNickname = async (nickname: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/auth/nickname`,
        { nickname },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    return response.data;
};

// 비밀번호 찾기 - 인증번호 요청
export const requestPasswordReset = async (email: string) => {
    const response = await axios.post(`${API_URL}/api/auth/password/request`, { email });
    return response.data;
};

// 비밀번호 찾기 - 인증번호 확인
export const verifyPasswordCode = async (email: string, code: string) => {
    const response = await axios.post(`${API_URL}/api/auth/password/verify`, { email, code });
    return response.data;
};

// 비밀번호 찾기 - 새 비밀번호 등록
export const resetPassword = async (email: string, code: string, newPassword: string) => {
    const response = await axios.post(`${API_URL}/api/auth/password/reset`, { email, code, newPassword });
    return response.data;
};

// 소셜 연동 현황 조회 (카카오/네이버 연결 여부)
export const getSocialAccounts = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/auth/social/accounts`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data as { kakao: boolean; naver: boolean; primaryType: number };
};

// 소셜 계정 연동 (OAuth 콜백 후 호출)
export const linkSocial = async (provider: 'kakao' | 'naver', code: string, state?: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/auth/link`,
        { provider, code, state },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

// 소셜 연동 충돌 해결 (기존 계정에서 떼어내 현재 계정으로 연결)
export const resolveLinkConflict = async (linkToken: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/auth/link/resolve`,
        { linkToken },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

// 소셜 연동 해제
export const disconnectSocial = async (provider: 'kakao' | 'naver') => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/auth/link/disconnect`,
        { provider },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

// 회원탈퇴
export const deleteAccount = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/auth/account/delete`, {}, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

// 사진 업로드
export const uploadPhoto = async (favPlaceId: number, photo: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/photo/upload`, { favPlaceId, photo }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// 사진 목록 조회
export const getPhotos = async (favPlaceId: number) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/photo/list/${favPlaceId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// 사진 삭제
export const deletePhoto = async (photoId: number) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/photo/delete/${photoId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// 일정 목록 조회
export const getSchedules = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/schedule/list`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// 일정 추가
export const addSchedule = async (data: { title: string; scheduleDate: string; description?: string; placeName?: string }) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/schedule/add`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// 일정 삭제
export const deleteSchedule = async (scheduleId: number) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/schedule/delete/${scheduleId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// 활동 목록 조회
export const getActivities = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/activity/list`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// 활동 모두 읽음
export const markActivitiesRead = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/activity/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};
// 메모 목록 조회
export const getNotes = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/note/list`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// 메모 추가
export const addNote = async (content: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/note/add`, { content }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// 메모 삭제
export const deleteNote = async (noteId: number) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/note/delete/${noteId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// 오늘의 질문 조회
export const getDailyQuestion = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/question/today`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// 답변 제출
export const answerDailyQuestion = async (questionId: number, answer: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/question/answer`, { question_id: questionId, answer }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// 지난 질문 모아보기
export const getQuestionHistory = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/question/history`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data as { history: { question_id: number; question: string; assigned_date: string; my_answer: string | null; partner_answer: string | null }[] };
};
