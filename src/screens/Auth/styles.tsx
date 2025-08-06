import { StyleSheet } from 'react-native';
import { color_1 } from '../../constants/colors';

export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color_1.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: color_1.surface,
    padding: 20,
    borderRadius: 10,
    shadowColor: color_1.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: color_1.textPrimary,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: color_1.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 12,
    fontSize: 16,
    color: color_1.textPrimary,
    backgroundColor: color_1.inputBackground,
  },
  errorText: {
    color: color_1.error,
    fontSize: 13,
    marginBottom: 10,
    marginLeft: 5,
  },
  linkText: {
    color: color_1.primary,
    fontSize: 14,
    alignSelf: 'flex-start',
    marginBottom: 20,
    paddingVertical: 5,
  },
  button: {
    backgroundColor: color_1.primary,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  buttonDisabled: {
    backgroundColor: color_1.primaryDisabled,
  },
  buttonText: {
    color: color_1.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
