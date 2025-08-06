import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Text, TextInput, TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import ErrorDisplay from '../../components/common/ErrorDisplay';
import { color_1 } from '../../constants/colors';
import type { AppDispatch, RootState } from '../../store';
import { registerUser } from '../../store/slices/authSlice';
import { getPasswordError, validateEmail } from '../../utils/validators';
import { authStyles as styles } from './styles'; // Đổi tên style để dễ đọc

interface RegistrationScreenProps {
  navigation: any;
}

const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  // Sử dụng useMemo để tính toán lỗi và chỉ chạy lại khi password thay đổi
  const passwordError = useMemo(() => getPasswordError(password), [password]);
  const isEmailValid = useMemo(() => validateEmail(email), [email]);

  // Form chỉ hợp lệ khi tất cả fields đều có và email đúng định dạng và không có lỗi mật khẩu
  const isFormValid = username && email && fullName && isEmailValid && !passwordError;

  const handleRegister = async () => {
    if (!isFormValid) {
      Alert.alert('Thông báo', 'Vui lòng kiểm tra lại thông tin đăng ký.');
      return;
    }

    try {
      await dispatch(registerUser({ username, email, password, fullName })).unwrap();
      Alert.alert('Thành công', 'Đăng ký tài khoản thành công!', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error) {
      // Error sẽ được hiển thị qua ErrorDisplay component
      console.error('Register error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Đăng ký tài khoản</Text>

        {error && (
          <ErrorDisplay 
            error={error}
            onRetry={handleRegister}
            showDetails={true}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Tên đăng nhập"
          placeholderTextColor={color_1.textSecondary}
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          style={styles.input}
          placeholder="Họ và tên"
          placeholderTextColor={color_1.textSecondary}
          value={fullName}
          onChangeText={setFullName}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={color_1.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          placeholderTextColor={color_1.textSecondary}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {password && passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>Đã có tài khoản?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, (!isFormValid || loading) && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={!isFormValid || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={color_1.white} />
          ) : (
            <Text style={styles.buttonText}>Đăng ký</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default RegistrationScreen;
