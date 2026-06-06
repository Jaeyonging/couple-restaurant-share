import React, { useEffect, useRef } from 'react'
import { useMarkerStore, useCurrentMarkerStore } from '../store/data';

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

export const NaverMap = ({ longtitude, latitude, favMarkers = [] }: Props) => {
    const mapElement = useRef(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const favMarkersRef = useRef<any[]>([]);
    const { marker } = useMarkerStore();
    const { currentMarker } = useCurrentMarkerStore();
    const { naver }: any = window;

    useEffect(() => {
        if (!mapElement.current || !naver) return;

        const location = new naver.maps.LatLng(longtitude, latitude);
        const mapOptions = {
            center: location,
            zoom: 15,
            zoomControl: true,
            zoomControlOptions: {
                position: naver.maps.Position.TOP_LEFT,
            },
        };

        const map = new naver.maps.Map(mapElement.current, mapOptions);
        mapRef.current = map;
    }, [longtitude, latitude, naver]);

    // 검색 결과 마커 업데이트
    useEffect(() => {
        if (!mapRef.current || !naver) return;

        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];

        marker.forEach((item) => {
            const lat = item.mapy / 10000000;
            const lng = item.mapx / 10000000;

            const newMarker = new naver.maps.Marker({
                position: new naver.maps.LatLng(lat, lng),
                map: mapRef.current,
            });

            markersRef.current.push(newMarker);
        });
    }, [marker, naver]);

    // 선택된 마커로 지도 이동
    useEffect(() => {
        if (!mapRef.current || !naver || !currentMarker) return;

        const lat = currentMarker.mapy / 10000000;
        const lng = currentMarker.mapx / 10000000;
        const offsetLat = lat - 0.0012;

        mapRef.current.setCenter(new naver.maps.LatLng(offsetLat, lng));
        mapRef.current.setZoom(17);
    }, [currentMarker, naver]);

    // 즐겨찾기 마커 (항상 표시)
    useEffect(() => {
        if (!mapRef.current || !naver) return;

        favMarkersRef.current.forEach((m) => m.setMap(null));
        favMarkersRef.current = [];

        favMarkers.forEach((item) => {
            const lat = item.mapy / 10000000;
            const lng = item.mapx / 10000000;
            if (!lat || !lng) return;

            const newMarker = new naver.maps.Marker({
                position: new naver.maps.LatLng(lat, lng),
                map: mapRef.current,
                icon: {
                    content: item.visited ? VISITED_MARKER_HTML(item.name) : FAV_MARKER_HTML(item.name),
                    anchor: new naver.maps.Point(13, 35),
                },
                zIndex: item.visited ? 11 : 10,
            });

            favMarkersRef.current.push(newMarker);
        });
    }, [favMarkers, naver]);

    return <div ref={mapElement} className='w-full h-full' />;
};
