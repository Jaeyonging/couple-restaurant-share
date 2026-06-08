import { create } from "zustand";

interface FetchDataState {
    data: any;
    imageData: any;
    setData: (newData: any) => void;
    setImageData: (newImageData: any) => void;
    resetData: () => void;
}

const useFetchDataStore = create<FetchDataState>((set) => ({
    data: null,
    imageData: null,
    setData: (newData) => set({ data: newData }),
    setImageData: (newImageData) => set({ imageData: newImageData }),
    resetData: () => set({ data: null, imageData: null }),
}));

interface MarkerData{
    mapx: number;
    mapy: number;
    name?: string;
}

interface MarkerState {
    marker: MarkerData[];
    setMarker: (newMarker: MarkerData[]) => void;
    resetMarker: () => void;
}

const useMarkerStore = create<MarkerState>((set) => ({
    marker: [],
    setMarker: (newMarker) => set({ marker: newMarker }),
    resetMarker: () => set({ marker: [] }),
}));

interface CurrentMarkerState {
    currentMarker: MarkerData | null;
    setCurrentMarker: (newCurrentMarker: MarkerData | null) => void;
    resetCurrentMarker: () => void;
}

const useCurrentMarkerStore = create<CurrentMarkerState>((set) => ({
    currentMarker: null,
    setCurrentMarker: (newCurrentMarker) => set({ currentMarker: newCurrentMarker }),
    resetCurrentMarker: () => set({ currentMarker: null }),
}));

interface MapState {
    search: string;
    longtitude: number;
    latitude: number;
    // 내 위치 (GPS) — WGS84 십진수. null = 미사용
    myLat: number | null;
    myLng: number | null;
    setSearch: (search: string) => void;
    setLongtitude: (longtitude: number) => void;
    setLatitude: (latitude: number) => void;
    setMyLocation: (lat: number | null, lng: number | null) => void;
}

const useMapStore = create<MapState>((set) => ({
    search: '',
    longtitude: 37.5530049,
    latitude: 127.0180,
    myLat: null,
    myLng: null,
    setSearch: (search) => set({ search }),
    setLongtitude: (longtitude) => set({ longtitude }),
    setLatitude: (latitude) => set({ latitude }),
    setMyLocation: (lat, lng) => set({ myLat: lat, myLng: lng }),
}));

interface LoginState {
    isLogin: boolean;
    setIsLogin: (isLogin: boolean) => void;
}

const initIsLogin = (): boolean => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return false;
        const payload = JSON.parse(atob(token.split('.')[1]));
        return !!(payload.exp && payload.exp * 1000 > Date.now());
    } catch {
        return false;
    }
};

const useLoginStore = create<LoginState>((set) => ({
    isLogin: initIsLogin(),
    setIsLogin: (isLogin) => set({ isLogin }),
}));

interface Toast {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
}

interface ToastState {
    toasts: Toast[];
    addToast: (type: Toast['type'], message: string) => void;
    removeToast: (id: string) => void;
}

const useToastStore = create<ToastState>((set) => ({
    toasts: [],
    addToast: (type, message) => {
        const id = Math.random().toString(36).slice(2);
        set((state) => ({ toasts: [...state.toasts, { id, type, message }] }));
        setTimeout(() => {
            set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
        }, 3000);
    },
    removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export { useFetchDataStore, useMarkerStore, useCurrentMarkerStore, useMapStore, useLoginStore, useToastStore };
