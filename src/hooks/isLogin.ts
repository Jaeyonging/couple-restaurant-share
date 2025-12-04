import { useLoginStore } from '../store/data';

export const useIsLogin = () => {
    const { isLogin } = useLoginStore();
    return isLogin;
};
