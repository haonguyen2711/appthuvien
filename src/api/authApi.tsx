
export const checkEmailExists = async (email) => {
  console.log(`API: Kiểm tra email: ${email}`);
  const existingEmails = ['test@gmail.com', 'admin@library.com'];
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(existingEmails.includes(email.toLowerCase()));
    }, 1000);
  });
};

// giả lập đăng ký tài khoản mới
export const registerUser = async (email, password) => {
  console.log(`API: Đang đăng ký với Email: ${email}, Mật khẩu: ${password}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      // Trong thực tế, bạn sẽ gửi email và mật khẩu đã được hash lên server
      resolve({ success: true, userId: '12345' });
    }, 1500);
  });
};