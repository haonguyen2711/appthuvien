


//kiểm tra email
export const validateEmail =(email)=>{
    if(!email) {
        return false;
    }
    const emailReger = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailReger.test(email);
    };

//kiểm tra thông báo lỗi mk
export const getPasswordError = (password) => {
  if (!password) return 'Mật khẩu không được để trống.';
  
  const errors = [];
  if (password.length < 8) {
    errors.push('ít nhất 8 ký tự');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('ít nhất 1 chữ hoa');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('ít nhất 1 chữ thường');
  }
  if (!/\d/.test(password)) {
    errors.push('ít nhất 1 chữ số');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('ít nhất 1 ký tự đặc biệt');
  }

  if (errors.length > 0) {
    return `Mật khẩu cần: ${errors.join(', ')}.`;
  }

  return ''; // trả về chuỗi rỗng nếu không có lỗi
};
