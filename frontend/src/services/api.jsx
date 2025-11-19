import axios from 'axios';

const api = axios.create({
//Biến Môi Trường: process.env.REACT_APP_API_URL cho phép bạn dễ dàng thay đổi địa chỉ API khi triển khai lên server thật mà không cần sửa code.
//Nếu biến môi trường không được đặt, nó sẽ mặc định sử dụng 'http://localhost:5000/api'.
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

//Thiết lập một hàm tự động chạy trước khi bất kỳ request nào được gửi đi.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Thêm interceptor cho response
api.interceptors.response.use(
    (response) => response, // Nếu response thành công thì trả về
    (error) => {
        // Nếu server trả về lỗi 401 (Unauthorized)
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            // Dùng replace để không giữ lại /employee trong history
            window.location.replace('/login');
        }
        return Promise.reject(error);
    }
);

export default api;