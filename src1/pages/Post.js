import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Image, Upload, Calendar, Alert, Instagram, Send } from 'lucide-react';
import api from '@/utills/api';

const VALID_PLATFORMS = ['linkedin', 'facebook', 'instagram'];

// Validation Schema
const validationSchema = Yup.object({
  caption: Yup.string()
    .min(1, 'Caption is required')
    .max(2200, 'Caption must be less than 2200 characters')
    .required('Caption is required'),
  
  platforms: Yup.array()
    .when('postType', {
      is: 'multi',
      then: (schema) => schema
        .min(1, 'Please select at least one platform')
        .of(Yup.string().oneOf(VALID_PLATFORMS)),
      otherwise: (schema) => schema
    }),
  
  images: Yup.array()
    .min(1, 'Please upload at least one image')
    .required('Images are required'),
  
  schedule: Yup.date()
    .nullable()
    .min(new Date(), 'Schedule time must be in the future'),
  
  postType: Yup.string()
    .oneOf(['multi', 'instagram'], 'Invalid post type')
    .required('Post type is required')
});

const Post = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [previewUrls, setPreviewUrls] = useState([]);

  // Initial form values
  const initialValues = {
    caption: '',
    platforms: [],
    images: [],
    schedule: '',
    postType: 'multi'
  };

  const handleImageChange = (e, setFieldValue) => {
    const files = Array.from(e.target.files);
    setFieldValue('images', files);
    
    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handlePlatformToggle = (platform, values, setFieldValue) => {
    const newPlatforms = values.platforms.includes(platform) 
      ? values.platforms.filter(p => p !== platform) 
      : [...values.platforms, platform];
    
    setFieldValue('platforms', newPlatforms);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('caption', values.caption);
      values.images.forEach(image => formData.append('images', image));
      
      // Add platforms only for multi-post
      if (values.postType === 'multi') {
        formData.append('platforms', JSON.stringify(values.platforms));
      }
      
      if (values.schedule) formData.append('schedule', values.schedule);

      const endpoint = values.postType === 'instagram' 
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
        text: values.schedule 
          ? `Post scheduled for ${new Date(values.schedule).toLocaleString()}`
          : values.postType === 'instagram'
            ? 'Posted successfully to Instagram'
            : `Posted successfully to ${values.platforms.join(', ')}`,
        data: response.data
      });

      // Reset form on success if not scheduled
      if (!values.schedule) {
        resetForm();
        setPreviewUrls([]);
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
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 border border-[#004b8f]/30 rounded-2xl shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold text-[#004b8f] dark:text-white mb-6 flex items-center gap-2">
        Create Post
      </h2>

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

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <form onSubmit={formik.handleSubmit}>
            {/* Post Type Selection */}
            <div className="mb-6">
              {formik.touched.postType && formik.errors.postType && (
                <p className="text-sm text-red-500 mt-1">
                  {formik.errors.postType}
                </p>
              )}
            </div>

            {/* Caption */}
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Post Caption<span className='text-red-500'>*</span>
              </label>
              <textarea
                name="caption"
                rows={4}
                placeholder="What's on your mind?"
                value={formik.values.caption}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b8f]"
              />
              {formik.touched.caption && formik.errors.caption && (
                <p className="text-sm text-red-500 mt-1">
                  {formik.errors.caption}
                </p>
              )}
            </div>

            {/* Platforms (only for multi-post) */}
            {formik.values.postType === 'multi' && (
              <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Platforms<span className='text-red-500'>*</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {VALID_PLATFORMS.map((platform) => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => handlePlatformToggle(platform, formik.values, formik.setFieldValue)}
                      className={`px-4 py-2 rounded-lg border ${
                        formik.values.platforms.includes(platform)
                          ? 'bg-[#004b8f] text-white border-[#004b8f] cursor-pointer'
                          : 'bg-white dark:bg-gray-700 border-[#004b8f] dark:border-gray-600 text-[#004b8f] dark:text-gray-300 cursor-pointer'
                      }`}
                    >
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </button>
                  ))}
                </div>
                {formik.touched.platforms && formik.errors.platforms && (
                  <p className="text-sm text-red-500 mt-1">
                    {formik.errors.platforms}
                  </p>
                )}
              </div>
            )}

            {/* Image Upload */}
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Upload Images <span className='text-red-500'>*</span>
              </label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer inline-block px-4 py-2 bg-[#004b8f] text-white text-sm font-medium rounded-md hover:bg-[#003a73] transition">
                  Choose Files
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, formik.setFieldValue)}
                    className="hidden"
                  />
                </label>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formik.values.images.length > 0 ? `${formik.values.images.length} file(s) selected` : 'No files selected'}
                </span>
              </div>
              {formik.touched.images && formik.errors.images && (
                <p className="text-sm text-red-500 mt-1">
                  {formik.errors.images}
                </p>
              )}

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
                <Calendar size={16}/> Schedule Post
              </label>
              <input
                type="datetime-local"
                name="schedule"
                value={formik.values.schedule}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                min={new Date().toISOString().slice(0, 16)}
                className="px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b8f]"
              />
              {formik.touched.schedule && formik.errors.schedule && (
                <p className="text-sm text-red-500 mt-1">
                  {formik.errors.schedule}
                </p>
              )}
              {formik.values.schedule && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Will post on: {new Date(formik.values.schedule).toLocaleString("en-GB")}
                </p>
              )}
            </div>

                                   <div className='space-y-4'>
             <p className='text-sm text-gray-500 dark:text-gray-400 '>
               ➡️ All fields marked with
               <span className='text-red-500'> *</span> are mandatory.
             </p>
             </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading || formik.isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-[#004b8f] text-white rounded-lg hover:bg-[#003b73] disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
              >
                {loading || formik.isSubmitting ? (
                  'Posting...'
                ) : formik.values.schedule ? (
                  <>
                    Schedule Post <Calendar size={18} /> 
                  </>
                ) : (
                  <>
                    Post Now <Send size={18} />
                  </>
                )}
              </button>
            </div>

          </form>
        )}
      </Formik>
    </div>
  );
};

export default Post;