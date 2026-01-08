import Banner from '../models/Banner.js';
import cloudinary from '../config/cloudinary.js';

export const createBanner = async (req, res) => {
  try {
    const banner = new Banner(req.body);
    await banner.save();
    res.status(201).json({ success: true, banner });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!banner) {
      return res
        .status(404)
        .json({ success: false, message: 'Banner олдсонгүй' });
    }
    res.json({ success: true, banner });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res
        .status(404)
        .json({ success: false, message: 'Banner олдсонгүй' });
    }
    res.json({ success: true, message: 'Banner амжилттай устгагдлаа' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1 });
    res.json({ success: true, banners });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res
        .status(404)
        .json({ success: false, message: 'Banner олдсонгүй' });
    }
    res.json({ success: true, banner });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const uploadBannerImage = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: 'No file provided' });
    }

    const uploaded = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'banners',
          transformation: [
            { width: 1600, height: 900, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    return res.status(201).json({ success: true, url: uploaded.secure_url });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
