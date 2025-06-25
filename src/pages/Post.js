import React, { useState } from 'react';
import { Image, Upload, Calendar, Alert, Instagram, Send } from 'lucide-react';
import api from '@/utills/api';

const VALID_PLATFORMS = ['linkedin', 'facebook', 'instagram'];

const Post = () => {
  const [caption, setCaption] = useState('');
  const [platforms, setPlatforms] = useState([]);
  const [images, setImages] = useState([]);
  const [schedule, setSchedule] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [postType, setPostType] = useState('multi'); // 'multi' or 'instagram'

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    
    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handlePlatformToggle = (platform) => {
    setPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform) 
        : [...prev, platform]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validation based on post type
    if (postType === 'multi' && platforms.length === 0) {
      setMessage({
        type: 'error',
        text: 'Please select at least one platform'
      });
      setLoading(false);
      return;
    }

    if (images.length === 0) {
      setMessage({
        type: 'error',
        text: 'Please upload at least one image'
      });
      setLoading(false);
      return;
    }

    if (schedule && new Date(schedule) < new Date()) {
      setMessage({
        type: 'error',
        text: 'Schedule time must be in the future'
      });
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('caption', caption);
      images.forEach(image => formData.append('images', image));
      
      // Add platforms only for multi-post
      if (postType === 'multi') {
        formData.append('platforms', JSON.stringify(platforms));
      }
      
      if (schedule) formData.append('schedule', schedule);

      const endpoint = postType === 'instagram' 
        ? '/nodesetup/social/post/instagram' 
        : '/nodesetup/social/post/multi';

      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      setMessage({
        type: 'success',
        text: schedule 
          ? `Post scheduled for ${new Date(schedule).toLocaleString()}`
          : postType === 'instagram'
            ? 'Posted successfully to Instagram'
            : `Posted successfully to ${platforms.join(', ')}`,
        data: response.data
      });

      // Reset form on success
      if (!schedule) {
        setCaption('');
        setImages([]);
        setPreviewUrls([]);
        if (postType === 'multi') {
          setPlatforms([]);
        }
      }
    } catch (error) {
      console.error('Posting error:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to create post',
        data: error.response?.data
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 border border-[#004b8f]/30 rounded-2xl shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold text-[#004b8f] dark:text-white mb-6 flex items-center gap-2">
        <Send size={20} /> Create Post
      </h2>

      {/* Post Type Toggle */}
      <div className="mb-6">
        <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden w-fit">
          <button
            type="button"
            onClick={() => setPostType('multi')}
            className={`px-4 py-2 ${postType === 'multi' ? 'bg-[#004b8f] text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
          >
            Multi-Platform
          </button>
          <button
            type="button"
            onClick={() => setPostType('instagram')}
            className={`px-4 py-2 flex items-center gap-2 ${postType === 'instagram' ? 'bg-[#004b8f] text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
          >
            <Instagram size={16} /> Instagram Only
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {message.text}
          {message.data?.data?.failedPlatforms && (
            <div className="mt-2">
              Failed platforms: {message.data.data.failedPlatforms.join(', ')}
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Caption */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Post Caption
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b8f]"
            rows={4}
            placeholder="What's on your mind?"
          />
        </div>

        {/* Platforms (only for multi-post) */}
        {postType === 'multi' && (
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Platforms
            </label>
            <div className="flex flex-wrap gap-3">
              {VALID_PLATFORMS.map((platform) => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => handlePlatformToggle(platform)}
                  className={`px-4 py-2 rounded-lg border ${
                    platforms.includes(platform)
                      ? 'bg-[#004b8f] text-white border-[#004b8f]'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Image Upload */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Upload Images
          </label>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
              <Upload size={16} />
              Choose Files
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {images.length > 0 ? `${images.length} file(s) selected` : 'No files selected'}
            </span>
          </div>

          {/* Image Previews */}
          {previewUrls.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative w-32 h-32">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Schedule */}
        <div className="mb-6">
          <label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Calendar size={16} /> Schedule Post (optional)
          </label>
          <input
            type="datetime-local"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b8f]"
          />
          {schedule && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Will post on: {new Date(schedule).toLocaleString()}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-[#004b8f] text-white rounded-lg hover:bg-[#003b73] disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? (
              'Posting...'
            ) : schedule ? (
              <>
                <Calendar size={16} /> Schedule Post
              </>
            ) : postType === 'instagram' ? (
              <>
                <Instagram size={16} /> Post to Instagram
              </>
            ) : (
              <>
                <Send size={16} /> Post Now
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Post;