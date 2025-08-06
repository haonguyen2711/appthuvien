// API Monitoring và Analytics utility
interface ApiCallLog {
  id: string;
  url: string;
  method: string;
  timestamp: Date;
  duration?: number;
  status?: number;
  success: boolean;
  error?: any;
  requestSize?: number;
  responseSize?: number;
}

class ApiMonitor {
  private logs: ApiCallLog[] = [];
  private maxLogs = 100; // Giữ tối đa 100 logs

  // Bắt đầu monitor một API call
  startCall(url: string, method: string): string {
    const id = `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const log: ApiCallLog = {
      id,
      url,
      method: method.toUpperCase(),
      timestamp: new Date(),
      success: false
    };

    this.logs.unshift(log);
    
    // Giữ số lượng logs trong giới hạn
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    return id;
  }

  // Kết thúc monitor một API call (thành công)
  endCall(id: string, status: number, responseSize?: number) {
    const log = this.logs.find(l => l.id === id);
    if (log) {
      log.duration = Date.now() - log.timestamp.getTime();
      log.status = status;
      log.success = status >= 200 && status < 300;
      log.responseSize = responseSize;
    }
  }

  // Kết thúc monitor một API call (lỗi)
  endCallWithError(id: string, error: any) {
    const log = this.logs.find(l => l.id === id);
    if (log) {
      log.duration = Date.now() - log.timestamp.getTime();
      log.success = false;
      log.error = error;
      log.status = error.details?.status || 0;
    }
  }

  // Lấy danh sách logs
  getLogs(): ApiCallLog[] {
    return [...this.logs];
  }

  // Lấy thống kê
  getStats() {
    const totalCalls = this.logs.length;
    const successCalls = this.logs.filter(l => l.success).length;
    const errorCalls = totalCalls - successCalls;
    const avgDuration = this.logs
      .filter(l => l.duration)
      .reduce((sum, l) => sum + (l.duration || 0), 0) / totalCalls;

    const errorsByType = this.logs
      .filter(l => !l.success)
      .reduce((acc, l) => {
        const status = l.status || 0;
        const key = status === 0 ? 'network' : `status_${status}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return {
      totalCalls,
      successCalls,
      errorCalls,
      successRate: totalCalls > 0 ? (successCalls / totalCalls) * 100 : 0,
      avgDuration: avgDuration || 0,
      errorsByType
    };
  }

  // Xuất logs dưới dạng JSON để debug
  exportLogs(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      stats: this.getStats(),
      logs: this.logs
    }, null, 2);
  }

  // Clear tất cả logs
  clearLogs() {
    this.logs = [];
  }

  // Lấy logs lỗi gần đây
  getRecentErrors(limit = 10): ApiCallLog[] {
    return this.logs
      .filter(l => !l.success)
      .slice(0, limit);
  }

  // Kiểm tra health của API (dựa trên success rate gần đây)
  getApiHealth(lookbackMinutes = 5): {
    status: 'healthy' | 'degraded' | 'down';
    successRate: number;
    recentCalls: number;
  } {
    const cutoffTime = new Date(Date.now() - lookbackMinutes * 60 * 1000);
    const recentLogs = this.logs.filter(l => l.timestamp > cutoffTime);
    
    const recentCalls = recentLogs.length;
    const recentSuccesses = recentLogs.filter(l => l.success).length;
    const successRate = recentCalls > 0 ? (recentSuccesses / recentCalls) * 100 : 100;

    let status: 'healthy' | 'degraded' | 'down';
    if (successRate >= 95) {
      status = 'healthy';
    } else if (successRate >= 80) {
      status = 'degraded';
    } else {
      status = 'down';
    }

    return {
      status,
      successRate,
      recentCalls
    };
  }
}

// Singleton instance
export const apiMonitor = new ApiMonitor();

// Hook để dễ dùng trong React components
export const useApiMonitor = () => {
  return {
    logs: apiMonitor.getLogs(),
    stats: apiMonitor.getStats(),
    health: apiMonitor.getApiHealth(),
    recentErrors: apiMonitor.getRecentErrors(),
    exportLogs: () => apiMonitor.exportLogs(),
    clearLogs: () => apiMonitor.clearLogs()
  };
};
