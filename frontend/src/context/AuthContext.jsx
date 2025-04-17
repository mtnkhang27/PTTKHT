import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Hoặc bạn có thể lưu một token ở đây
  const navigate = useNavigate();

  const login = (userData) => {
    // Trong ứng dụng thực tế, bạn sẽ gọi API đăng nhập ở đây
    // Sau khi đăng nhập thành công, bạn sẽ cập nhật trạng thái user
    setUser(userData);
    navigate('/'); // Chuyển hướng đến trang chủ sau khi đăng nhập
  };

  const logout = () => {
    // Trong ứng dụng thực tế, bạn có thể xóa token hoặc thực hiện các hành động đăng xuất khác
    setUser(null);
    navigate('/login'); // Chuyển hướng đến trang đăng nhập sau khi đăng xuất
  };

  const isAuthenticated = () => {
    // Kiểm tra xem người dùng đã đăng nhập hay chưa (ví dụ: kiểm tra xem user có tồn tại hay không)
    return !!user;
    // Hoặc kiểm tra sự tồn tại và tính hợp lệ của token
    // return !!localStorage.getItem('authToken');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook tùy chỉnh để sử dụng context dễ dàng hơn
export const useAuth = () => {
  return useContext(AuthContext);
};