import { create } from "zustand";

interface FetchDataState {
    data: any;
    setData: (newData: any) => void;
    resetData: () => void;
}

const useFetchDataStore = create<FetchDataState>((set) => ({
    data: null,
    setData: (newData) => set({ data: newData }),
    resetData: () => set({ data: null }),
}));


interface MarkerData{
    address: string;
    category: string;
    description: string;
    link: string;
    mapx: number;
    mapy: number;
    roadAddress: string;
    telephone: string;
    title: string;
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

export { useFetchDataStore, useMarkerStore, useCurrentMarkerStore};