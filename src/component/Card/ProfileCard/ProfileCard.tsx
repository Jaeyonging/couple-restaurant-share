import React, { useState, useRef, useEffect } from 'react'
import { RenderImg } from '../../RenderImg'
import { updateProfileImage, updateNickname } from '../../../api/fetch';
import { API_URL } from '../../../types/types';
import { FiCamera, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { useToastStore } from '../../../store/data';

interface Props {
    user?: string;
    imgUrl?: string;
    isEditable?: boolean;
    userId?: number;
}

const ProfileCard = ({ user, imgUrl, isEditable = false, userId }: Props) => {
    const [profileImg, setProfileImg] = useState(imgUrl || '../noimg.jpeg');
    const [isUploading, setIsUploading] = useState(false);
    const [isEditingNickname, setIsEditingNickname] = useState(false);
    const [nicknameInput, setNicknameInput] = useState(user || '');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const nicknameInputRef = useRef<HTMLInputElement>(null);
    const { addToast } = useToastStore();

    useEffect(() => {
        if (imgUrl) setProfileImg(imgUrl);
    }, [imgUrl]);

    useEffect(() => {
        if (user) setNicknameInput(user);
    }, [user]);

    useEffect(() => {
        if (isEditingNickname) nicknameInputRef.current?.focus();
    }, [isEditingNickname]);

    const handleEditClick = () => {
        if (isEditable && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleNicknameSave = async () => {
        const trimmed = nicknameInput.trim();
        if (!trimmed) {
            addToast('error', '닉네임을 입력해주세요.');
            return;
        }
        if (trimmed === user) {
            setIsEditingNickname(false);
            return;
        }
        if (trimmed.length > 20) {
            addToast('error', '닉네임은 20자 이하여야 합니다.');
            return;
        }
        try {
            const res = await updateNickname(trimmed);
            if (res.token) localStorage.setItem('token', res.token);
            addToast('success', '닉네임이 변경되었습니다.');
            setIsEditingNickname(false);
            window.location.reload();
        } catch (error: any) {
            addToast('error', error.response?.data?.error || '닉네임 변경에 실패했습니다.');
        }
    };

    const handleNicknameKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleNicknameSave();
        if (e.key === 'Escape') {
            setNicknameInput(user || '');
            setIsEditingNickname(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            addToast('error', '이미지 파일만 업로드 가능합니다.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            addToast('error', '파일 크기는 5MB 이하여야 합니다.');
            return;
        }

        setIsUploading(true);

        try {
            const resizeImage = (file: File, maxWidth: number, maxHeight: number, quality: number = 0.8): Promise<string> => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = new Image();
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            let width = img.width;
                            let height = img.height;

                            if (width > height) {
                                if (width > maxWidth) {
                                    height = (height * maxWidth) / width;
                                    width = maxWidth;
                                }
                            } else {
                                if (height > maxHeight) {
                                    width = (width * maxHeight) / height;
                                    height = maxHeight;
                                }
                            }

                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            if (!ctx) { reject(new Error('Canvas context error')); return; }
                            ctx.drawImage(img, 0, 0, width, height);
                            resolve(canvas.toDataURL('image/jpeg', quality));
                        };
                        img.onerror = reject;
                        img.src = e.target?.result as string;
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            };

            const resizedBase64 = await resizeImage(file, 600, 600, 0.7);

            if (resizedBase64.length > 2 * 1024 * 1024) {
                addToast('error', '이미지가 너무 큽니다.');
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            const response = await updateProfileImage(resizedBase64);

            if (response.user?.imgUrl) {
                const fullImageUrl = response.user.imgUrl.startsWith('http')
                    ? response.user.imgUrl
                    : `${API_URL}${response.user.imgUrl}`;
                setProfileImg(fullImageUrl);
                addToast('success', '프로필 사진이 변경되었습니다.');
                window.location.reload();
            }
        } catch (error: any) {
            addToast('error', error.response?.data?.error || '업로드에 실패했습니다.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 ring-4 ring-white shadow-soft">
                    {isUploading ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <RenderImg
                            imgurl={profileImg}
                            alt="profile"
                            className='w-full h-full object-cover'
                        />
                    )}
                </div>
                {isEditable && (
                    <button
                        onClick={handleEditClick}
                        className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-primary-600 transition-colors"
                    >
                        <FiCamera className="text-sm" />
                    </button>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>

            {/* Nickname */}
            {isEditable && isEditingNickname ? (
                <div className="flex items-center gap-1">
                    <input
                        ref={nicknameInputRef}
                        type="text"
                        value={nicknameInput}
                        onChange={(e) => setNicknameInput(e.target.value)}
                        onKeyDown={handleNicknameKeyDown}
                        maxLength={20}
                        className="text-sm font-semibold text-gray-900 bg-gray-50 border border-primary-300 rounded-lg px-2 py-1 w-28 text-center focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                    <button onClick={handleNicknameSave} className="p-1 text-green-500 hover:text-green-600">
                        <FiCheck className="text-sm" />
                    </button>
                    <button onClick={() => { setNicknameInput(user || ''); setIsEditingNickname(false); }} className="p-1 text-gray-400 hover:text-gray-600">
                        <FiX className="text-sm" />
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-1">
                    <span className="text-base font-semibold text-gray-900">
                        {user || '사용자'}
                    </span>
                    {isEditable && (
                        <button
                            onClick={() => setIsEditingNickname(true)}
                            className="p-1 text-gray-300 hover:text-primary-500 transition-colors"
                        >
                            <FiEdit2 className="text-xs" />
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

export default ProfileCard
