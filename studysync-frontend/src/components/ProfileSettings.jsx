import React, { useState, useEffect } from 'react';
import { getCurrentUser, updateProfile, uploadAvatar } from '../services/api';
import { User, Camera, Save, CheckCircle } from 'lucide-react';

const ProfileSettings = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        profession: '',
        bio: '',
        points: 0,
        email: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const data = await getCurrentUser();
            setUser(data);
            setFormData({
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                profession: data.profession || '',
                bio: data.bio || '',
                points: data.points,
                email: data.email
            });
        } catch (error) {
            console.error('Failed to load user', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        try {
            await updateProfile(formData);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            // Update local storage user if needed
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...storedUser, ...formData }));
            window.dispatchEvent(new Event('storage')); // Trigger update elsewhere

            // Reload user to sync state
            loadUser();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            await uploadAvatar(file);
            loadUser(); // Reload to get new URL
            setMessage({ type: 'success', text: 'Avatar updated!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to upload avatar.' });
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 animate-fadeIn">
            <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
                <div className="flex items-center gap-6 mb-8">
                    <div className="relative group">
                        <div className="h-24 w-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center border-4 border-white shadow-lg">
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-3xl font-bold text-gray-400">{formData.firstName?.[0] || 'U'}</span>
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white cursor-pointer shadow-md hover:bg-blue-700 transition-colors">
                            <Camera className="h-4 w-4" />
                            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                        </label>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">{formData.firstName} {formData.lastName}</h3>
                        <p className="text-gray-500">{formData.email}</p>
                        <span className="inline-block mt-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-bold">
                            {formData.points} Points
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500/20 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500/20 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Profession / Role Title</label>
                        <input
                            type="text"
                            name="profession"
                            value={formData.profession}
                            onChange={handleChange}
                            placeholder="e.g. Computer Science Student"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500/20 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Tell us about yourself..."
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
                        />
                    </div>

                    {message.text && (
                        <div className={`p-4 rounded-xl flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {message.type === 'success' && <CheckCircle className="h-5 w-5" />}
                            {message.text}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                        >
                            <Save className="h-5 w-5" />
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileSettings;
