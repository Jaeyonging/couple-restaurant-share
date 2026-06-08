import React, { useEffect, useRef, useState } from 'react'
import { useMarkerStore, useCurrentMarkerStore, useMapStore } from '../store/data';

interface FavMarker {
    mapx: number;
    mapy: number;
    name: string;
    visited?: boolean;
}

interface Props {
    longtitude: number
    latitude: number
    favMarkers?: FavMarker[]
}

const FAV_MARKER_HTML = (name: string) => `
    <div style="display:flex; flex-direction:column; align-items:center; cursor:pointer;">
        <div style="
            background: #ec4899;
            border: 2.5px solid white;
            border-radius: 50% 50% 50% 0;
            width: 26px; height: 26px;
            display: flex; align-items: center; justify-content: center;
            transform: rotate(-45deg);
            box-shadow: 0 2px 8px rgba(236,72,153,0.5);
        ">
            <span style="transform: rotate(45deg); font-size: 13px; line-height:1;">♥</span>
        </div>
        <div style="
            margin-top: 3px;
            background: rgba(236,72,153,0.9);
            color: white;
            font-size: 10px;
            font-weight: 600;
            padding: 2px 6px;
            border-radius: 8px;
            white-space: nowrap;
            max-width: 80px;
            overflow: hidden;
            text-overflow: ellipsis;
            box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        ">${name}</div>
    </div>
`;

const VISITED_MARKER_HTML = (name: string) => `
    <div style="display:flex; flex-direction:column; align-items:center; cursor:pointer;">
        <div style="
            background: #22c55e;
            border: 2.5px solid white;
            border-radius: 50% 50% 50% 0;
            width: 26px; height: 26px;
            display: flex; align-items: center; justify-content: center;
            transform: rotate(-45deg);
            box-shadow: 0 2px 8px rgba(34,197,94,0.5);
        ">
            <span style="transform: rotate(45deg); font-size: 12px; line-height:1;">✓</span>
        </div>
        <div style="
            margin-top: 3px;
            background: rgba(34,197,94,0.9);
            color: white;
            font-size: 10px;
            font-weight: 600;
            padding: 2px 6px;
            border-radius: 8px;
            white-space: nowrap;
            max-width: 80px;
            overflow: hidden;
            text-overflow: ellipsis;
            box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        ">${name}</div>
    </div>
`;

const MY_LOCATION_HTML = `
    <div style="position:relative; width:18px; height:18px;">
        <div style="position:absolute; inset:0; background:#3b82f6; border:3px solid white; border-radius:50%; box-shadow:0 1px 6px rgba(0,0,0,0.3);"></div>
        <div style="position:absolute; left:50%; top:50%; width:36px; height:36px; border-radius:50%; background:rgba(59,130,246,0.25); animation:ripple 1.8s ease-out infinite;"></div>
    </div>
`;

// 카카오 지도 SDK를 한 번만 동적 로드 (autoload=false → kakao.maps.load 콜백 보장)
let sdkPromise: Promise<void> | null = null;
const loadKakaoSdk = (): Promise<void> => {
    if (sdkPromise) return sdkPromise;
    sdkPromise = new Promise((resolve, reject) => {
        const w = window as any;
        if (w.kakao && w.kakao.maps && w.kakao.maps.Map) return resolve();

        const appkey = import.meta.env.VITE_KAKAO_JS_KEY;
        if (!appkey) return reject(new Error('VITE_KAKAO_JS_KEY 가 설정되지 않았습니다.'));

        const finalize = () => w.kakao.maps.load(() => resolve());

        const existing = document.getElementById('kakao-map-sdk') as HTMLScriptElement | null;
        if (existing) {
            existing.addEventListener('load', finalize);
            existing.addEventListener('error', () => reject(new Error('카카오 지도 SDK 로드 실패')));
            return;
        }

        const script = document.createElement('script');
        script.id = 'kakao-map-sdk';
        script.async = true;
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appkey}&autoload=false&libraries=services`;
        script.onload = finalize;
        script.onerror = () => reject(new Error('카카오 지도 SDK 로드 실패'));
        document.head.appendChild(script);
    });
    return sdkPromise;
};

// 바텀시트가 하단을 가리므로 선택 지점을 위로 살짝 올려서 중심 이동
const SHEET_OFFSET = 0.0012;

export const KakaoMap = ({ longtitude, latitude, favMarkers = [] }: Props) => {
    const mapElement = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const favOverlaysRef = useRef<any[]>([]);
    const myLocationRef = useRef<any>(null);
    const [ready, setReady] = useState(false);
    const { marker } = useMarkerStore();
    const { currentMarker, setCurrentMarker } = useCurrentMarkerStore();
    const { myLat, myLng } = useMapStore();

    // SDK 로드
    useEffect(() => {
        let mounted = true;
        loadKakaoSdk()
            .then(() => { if (mounted) setReady(true); })
            .catch((e) => console.error('Kakao SDK:', e.message));
        return () => { mounted = false; };
    }, []);

    // 지도 초기화 (한 번만 — longtitude=위도, latitude=경도, 레거시 변수명)
    useEffect(() => {
        if (!ready || !mapElement.current || mapRef.current) return;
        const kakao = (window as any).kakao;

        const map = new kakao.maps.Map(mapElement.current, {
            center: new kakao.maps.LatLng(longtitude, latitude),
            level: 4,
        });
        map.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.TOPLEFT);
        mapRef.current = map;
    }, [ready, longtitude, latitude]);

    // 검색 결과 마커 업데이트
    useEffect(() => {
        if (!ready || !mapRef.current) return;
        const kakao = (window as any).kakao;

        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];

        marker.forEach((item) => {
            const lat = item.mapy / 10000000;
            const lng = item.mapx / 10000000;
            if (!lat || !lng) return;

            const mk = new kakao.maps.Marker({
                position: new kakao.maps.LatLng(lat, lng),
                map: mapRef.current,
            });
            kakao.maps.event.addListener(mk, 'click', () => {
                setCurrentMarker({ mapx: item.mapx, mapy: item.mapy, name: item.name });
            });
            markersRef.current.push(mk);
        });
    }, [marker, ready, setCurrentMarker]);

    // 선택된 마커로 부드럽게 이동 + 정보창
    useEffect(() => {
        if (!ready || !mapRef.current || !currentMarker) return;
        const kakao = (window as any).kakao;

        const lat = currentMarker.mapy / 10000000;
        const lng = currentMarker.mapx / 10000000;
        if (!lat || !lng) return;

        if (mapRef.current.getLevel() > 5) mapRef.current.setLevel(4);
        mapRef.current.panTo(new kakao.maps.LatLng(lat - SHEET_OFFSET, lng));
    }, [currentMarker, ready]);

    // 즐겨찾기 마커 (CustomOverlay, 항상 표시) + 클릭 시 정보창
    useEffect(() => {
        if (!ready || !mapRef.current) return;
        const kakao = (window as any).kakao;

        favOverlaysRef.current.forEach((o) => o.setMap(null));
        favOverlaysRef.current = [];

        favMarkers.forEach((item) => {
            const lat = item.mapy / 10000000;
            const lng = item.mapx / 10000000;
            if (!lat || !lng) return;

            const el = document.createElement('div');
            el.innerHTML = item.visited ? VISITED_MARKER_HTML(item.name) : FAV_MARKER_HTML(item.name);
            el.addEventListener('click', () => {
                mapRef.current.panTo(new kakao.maps.LatLng(lat - SHEET_OFFSET, lng));
            });

            const overlay = new kakao.maps.CustomOverlay({
                position: new kakao.maps.LatLng(lat, lng),
                content: el,
                xAnchor: 0.5,
                yAnchor: 0.72,
                zIndex: item.visited ? 11 : 10,
            });
            overlay.setMap(mapRef.current);
            favOverlaysRef.current.push(overlay);
        });
    }, [favMarkers, ready]);

    // 내 위치 (GPS) — 파란 점 + 부드럽게 이동
    useEffect(() => {
        if (!ready || !mapRef.current) return;
        const kakao = (window as any).kakao;

        if (myLat == null || myLng == null) {
            myLocationRef.current?.setMap(null);
            myLocationRef.current = null;
            return;
        }

        const pos = new kakao.maps.LatLng(myLat, myLng);
        if (!myLocationRef.current) {
            const el = document.createElement('div');
            el.innerHTML = MY_LOCATION_HTML;
            myLocationRef.current = new kakao.maps.CustomOverlay({
                position: pos, content: el, xAnchor: 0.5, yAnchor: 0.5, zIndex: 5,
            });
            myLocationRef.current.setMap(mapRef.current);
        } else {
            myLocationRef.current.setPosition(pos);
        }
        if (mapRef.current.getLevel() > 5) mapRef.current.setLevel(4);
        mapRef.current.panTo(pos);
    }, [myLat, myLng, ready]);

    return <div ref={mapElement} className='w-full h-full' />;
};
