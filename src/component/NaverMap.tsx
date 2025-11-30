import React, { useEffect, useRef } from 'react'
import { useMarkerStore, useCurrentMarkerStore } from '../store/data';

interface Props {
    longtitude: number
    latitude: number
}

export const NaverMap = ({ longtitude, latitude }: Props) => {
    const mapElement = useRef(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const {marker} = useMarkerStore();
    const {currentMarker} = useCurrentMarkerStore();
    const { naver }: any = window;

    // 지도 초기화
    useEffect(() => {
        if (!mapElement.current || !naver) return;

        const location = new naver.maps.LatLng(longtitude, latitude)
        const mapOptions = {
            center: location,
            zoom: 10,
            zoomControl: true,
        };

        const map = new naver.maps.Map(mapElement.current, mapOptions);
        mapRef.current = map;
    }, [longtitude, latitude, naver]);

    // 마커 업데이트
    useEffect(() => {
        if (!mapRef.current || !naver) return;

        markersRef.current.forEach((marker) => {
            marker.setMap(null);
        });
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

    // currentMarker가 변경되면 지도 중심 이동
    useEffect(() => {
        if (!mapRef.current || !naver || !currentMarker) return;

        const lat = currentMarker.mapy / 10000000;
        const lng = currentMarker.mapx / 10000000;
        
        const newPosition = new naver.maps.LatLng(lat, lng);
        mapRef.current.setCenter(newPosition);
        mapRef.current.setZoom(17);
    }, [currentMarker, naver]);

    return (
        <>
            <div ref={mapElement} className='w-full h-full' />
        </>
    );
};
