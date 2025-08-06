// Logger service để debug console logs
class LoggerService {
  static log(message: string, data?: any) {
    console.log(`[LOGGER] ${message}`, data);
    console.warn(`[LOGGER WARNING] ${message}`, data); // Use warning to ensure visibility
    console.error(`[LOGGER ERROR] ${message}`, data); // Force visibility
  }

  static error(message: string, error?: any) {
    console.error(`[LOGGER ERROR] ${message}`, error);
    console.warn(`[LOGGER ERROR WARNING] ${message}`, error);
  }
}

export default LoggerService;
