import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin, BUCKETS } from '../config/supabase.js';

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || ['webp', 'xmp', 'png', 'jpg', 'jpeg'];
  const fileExtension = file.originalname.split('.').pop().toLowerCase();
  
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`File type .${fileExtension} not allowed. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
  }
});

// Helper function to check if bucket exists
const checkBucketExists = async (bucketName) => {
  try {
    const { data, error } = await supabaseAdmin.storage.listBuckets();
    if (error) {
      console.error('Error listing buckets:', error);
      return false;
    }
    return data?.some(bucket => bucket.name === bucketName) || false;
  } catch (error) {
    console.error('Error checking bucket existence:', error);
    return false;
  }
};

// Helper function to create bucket if it doesn't exist
const ensureBucketExists = async (bucketName) => {
  try {
    const exists = await checkBucketExists(bucketName);
    if (!exists) {
      console.log(`Creating storage bucket "${bucketName}"...`);
      const { data, error } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: true, // Make bucket public for file access
      });

      if (error) {
        console.error(`Failed to create bucket "${bucketName}":`, error);
        throw new Error(
          `Storage bucket "${bucketName}" not found and could not be created automatically: ${error.message}. ` +
          `Please create it manually in Supabase Storage settings. ` +
          `Go to your Supabase project > Storage > Create bucket and name it "${bucketName}". ` +
          `Make sure to set it as public.`
        );
      }
      console.log(`✅ Storage bucket "${bucketName}" created successfully`);
      return true;
    }
    return true;
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
    throw error;
  }
};

// Helper function to upload file to Supabase Storage
export const uploadToSupabase = async (file, bucketName, folder = '') => {
  try {
    // Ensure bucket exists (create if it doesn't)
    await ensureBucketExists(bucketName);

    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${folder}/${uuidv4()}.${fileExtension}`;
    
    const { data, error } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      // Provide more detailed error messages
      if (error.message.includes('Bucket not found') || error.message.includes('not found')) {
        throw new Error(
          `Storage bucket "${bucketName}" not found. Please create it in Supabase Storage settings. ` +
          `Go to your Supabase project > Storage > Create bucket and name it "${bucketName}".`
        );
      }
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return {
      fileName,
      url: urlData.publicUrl,
      path: data.path
    };
  } catch (error) {
    console.error('Supabase upload error:', error);
    throw new Error(`File upload failed: ${error.message}`);
  }
};

// Helper function to delete file from Supabase Storage
export const deleteFromSupabase = async (bucketName, filePath) => {
  try {
    const { error } = await supabaseAdmin.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      throw new Error(`Delete failed: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('Supabase delete error:', error);
    throw new Error(`File delete failed: ${error.message}`);
  }
};

// Middleware for handling upload errors
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files' });
    }
  }
  
  if (error.message.includes('File type')) {
    return res.status(400).json({ error: error.message });
  }
  
  next(error);
};
