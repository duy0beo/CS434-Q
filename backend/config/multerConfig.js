import multer from 'multer';
import path from 'path';

// Cấu hình nơi lưu trữ file
const storage = multer.diskStorage({
  // Thư mục để lưu file upload
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  // Đặt lại tên file để tránh bị trùng lặp
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Kiểm tra định dạng file, chỉ cho phép upload ảnh
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Chỉ hỗ trợ định dạng file JPG hoặc PNG!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // Giới hạn kích thước file là 5MB
  }
});

export default upload;