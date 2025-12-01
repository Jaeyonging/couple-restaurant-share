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
