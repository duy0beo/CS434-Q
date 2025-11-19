import React, { useState, useRef } from 'react'; // ✅ Thêm useRef
import { FaUserCircle, FaEdit, FaSave, FaTimes, FaCamera } from 'react-icons/fa'; // ✅ Thêm FaCamera
import api from '../../services/api';
import toast from 'react-hot-toast'; // Import toast để thông báo

const ProfileSection = ({ initialProfile, onProfileUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState(initialProfile);
    const [originalProfile, setOriginalProfile] = useState(initialProfile);
    const [isLoading, setIsLoading] = useState(false);
    
    // ✅ Khai báo các state và ref còn thiếu
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(initialProfile?.avatar);
    const fileInputRef = useRef(null);

    const handleEdit = () => {
        setOriginalProfile(profile);
        setIsEditing(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (['address', 'city', 'country', 'id_number'].includes(name)) {
            setProfile(prev => ({ ...prev, customer: { ...prev.customer, [name]: value }}));
        } else {
            setProfile(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCancel = () => {
        setProfile(originalProfile);
        setAvatarFile(null);
        setAvatarPreview(originalProfile.avatar);
        setIsEditing(false);
    };

    // ✅ Khai báo hàm xử lý còn thiếu
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };
    
    const handleSave = async () => {
        setIsLoading(true);
        let profileToSave = { ...profile };

        try {
            // Bước 1: Nếu có file ảnh mới, tải nó lên trước
            if (avatarFile) {
                const formData = new FormData();
                formData.append('avatar', avatarFile);
                const uploadRes = await api.post('/users/upload-avatar', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                // Cập nhật đường dẫn avatar mới vào object profile sẽ được lưu
                profileToSave.avatar = uploadRes.data.avatarUrl;
            }

            // Bước 2: Gửi toàn bộ dữ liệu profile đã cập nhật (bao gồm cả avatar mới nếu có) lên server
            const updateRes = await api.put('/users/me/profile', profileToSave);
            const finalUpdatedProfile = updateRes.data.user; // Giả sử API trả về user đã cập nhật
            
            // Bước 3: Cập nhật state ở local và component cha
            setProfile(finalUpdatedProfile);
            setOriginalProfile(finalUpdatedProfile);
            if (onProfileUpdate) {
                onProfileUpdate(finalUpdatedProfile); // Gửi dữ liệu mới nhất lên cha
            }
            
            setIsEditing(false);
            toast.success('Cập nhật hồ sơ thành công!'); // Thêm thông báo thành công

        } catch (err) {
            console.error("Failed to save profile:", err);
            toast.error('Cập nhật hồ sơ thất bại!'); // Thêm thông báo lỗi
        } finally {
            setIsLoading(false);
        }
    };

    if (!profile) return null;

    return (
        <section className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div className="flex items-center text-2xl font-semibold text-gray-900 mb-6">
                <FaUserCircle className="mr-3 text-blue-500" /> Hồ sơ cá nhân
                <div className="ml-auto flex items-center gap-3">
                    {isEditing ? (
                        <>
                            <button onClick={handleCancel} className="flex items-center text-sm font-medium px-3 py-1.5 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors">
                                <FaTimes className="mr-1.5" /> Hủy
                            </button>
                            <button onClick={handleSave} disabled={isLoading} className="flex items-center text-sm font-medium px-3 py-1.5 rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors">
                                <FaSave className="mr-1.5" /> {isLoading ? 'Đang lưu...' : 'Lưu'}
                            </button>
                        </>
                    ) : (
                        <button onClick={handleEdit} className="flex items-center text-sm font-medium px-3 py-1.5 rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors">
                            <FaEdit className="mr-1.5" /> Chỉnh sửa
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-col items-center mb-8">
                <div className="relative">
                    <img 
                        src={avatarPreview ? `http://localhost:5000${avatarPreview}` : 'https://via.placeholder.com/128'}
                        alt="Avatar"
                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                    />
                    {isEditing && (
                        <button 
                            onClick={() => fileInputRef.current.click()}
                            className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                        >
                            <FaCamera />
                        </button>
                    )}
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/png, image/jpeg"
                />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {isEditing ? (
                    <>
                        <InfoField label="Họ" name="lastName" value={profile.lastName} isEditing={true} onChange={handleInputChange} />
                        <InfoField label="Tên" name="firstName" value={profile.firstName} isEditing={true} onChange={handleInputChange} />
                    </>
                ) : (
                    <InfoField label="Họ và tên" value={`${profile.lastName} ${profile.firstName}`} isEditing={false} />
                )}
                <InfoField label="Email" name="email" value={profile.email} isEditing={false} disabled={true} />
                <InfoField label="Số điện thoại" name="phone" value={profile.phone} isEditing={isEditing} onChange={handleInputChange} />
                <InfoField label="Số CCCD/Passport" name="id_number" value={profile.customer?.id_number} isEditing={isEditing} onChange={handleInputChange} />
                <div className="md-col-span-2">
                    <InfoField label="Địa chỉ" name="address" value={profile.customer?.address} isEditing={isEditing} onChange={handleInputChange} />
                </div>
                <InfoField label="Thành phố" name="city" value={profile.customer?.city} isEditing={isEditing} onChange={handleInputChange} />
                <InfoField label="Quốc gia" name="country" value={profile.customer?.country} isEditing={isEditing} onChange={handleInputChange} />
            </div>
        </section>
    );
};

const InfoField = ({ label, name, value, isEditing, onChange, disabled = false }) => (
    <div>
        <label className="text-sm font-semibold text-gray-500">{label}</label>
        {isEditing ? (
            <input 
                type="text"
                name={name}
                value={value || ''}
                onChange={onChange}
                className={`mt-1 block w-full text-base rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                disabled={disabled}
            />
        ) : (
            <p className="mt-1 text-base text-gray-900 h-10 flex items-center">{value || ''}</p>
        )}
    </div>
);

export default ProfileSection;