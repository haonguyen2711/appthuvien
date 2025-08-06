import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { color_1 } from '../../constants/colors';
import { useApiMonitor } from '../../utils/apiMonitor';

interface DevToolsProps {
  visible: boolean;
  onClose: () => void;
}

export const DevTools: React.FC<DevToolsProps> = ({ visible, onClose }) => {
  const { logs, stats, health, recentErrors, exportLogs, clearLogs } = useApiMonitor();
  const [refreshKey, setRefreshKey] = useState(0);

  // Auto refresh mỗi 2 giây
  useEffect(() => {
    if (!visible) return;
    
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 2000);

    return () => clearInterval(interval);
  }, [visible]);

  const handleExportLogs = async () => {
    try {
      const logData = exportLogs();
      await Share.share({
        message: logData,
        title: 'API Monitor Logs'
      });
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể xuất logs');
    }
  };

  const handleClearLogs = () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa tất cả logs?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', onPress: clearLogs, style: 'destructive' }
      ]
    );
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#10b981';
      case 'degraded': return '#f59e0b';
      case 'down': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const showLogDetails = (log: any) => {
    let details = `
🔍 API Call Details:
• Method: ${log.method}
• URL: ${log.url}
• Status: ${log.status || 'N/A'}
• Success: ${log.success ? 'Yes' : 'No'}
• Duration: ${log.duration ? formatDuration(log.duration) : 'N/A'}
• Time: ${log.timestamp.toLocaleString()}`;

    if (log.error) {
      details += `\n\n❌ Error Details:`;
      if (log.error.message) {
        details += `\n• Message: ${log.error.message}`;
      }
      if (log.error.response?.data) {
        details += `\n• Response Data: ${JSON.stringify(log.error.response.data, null, 2)}`;
      }
      if (log.error.validationErrors) {
        details += `\n• Validation Errors: ${JSON.stringify(log.error.validationErrors, null, 2)}`;
      }
    }

    Alert.alert('API Call Details', details.trim(), [
      { text: 'Đóng', style: 'cancel' },
      { text: 'Copy Log', onPress: () => {
        console.log('=== API CALL LOG ===');
        console.log(details);
        console.log('=== FULL LOG OBJECT ===');
        console.log(log);
        console.log('==================');
      }}
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🔧 Dev Tools - API Monitor</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* API Health Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 API Health</Text>
            <View style={styles.healthContainer}>
              <View style={[styles.healthDot, { backgroundColor: getHealthColor(health.status) }]} />
              <Text style={styles.healthText}>
                {health.status.toUpperCase()} ({health.successRate.toFixed(1)}%)
              </Text>
            </View>
            <Text style={styles.subText}>
              {health.recentCalls} calls in last 5 minutes
            </Text>
          </View>

          {/* Statistics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📈 Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.totalCalls}</Text>
                <Text style={styles.statLabel}>Total Calls</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.successCalls}</Text>
                <Text style={styles.statLabel}>Success</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.errorCalls}</Text>
                <Text style={styles.statLabel}>Errors</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatDuration(stats.avgDuration)}</Text>
                <Text style={styles.statLabel}>Avg Duration</Text>
              </View>
            </View>
          </View>

          {/* Recent Errors */}
          {recentErrors.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🚨 Recent Errors</Text>
              {recentErrors.slice(0, 5).map((log, index) => (
                <View key={log.id} style={styles.errorItem}>
                  <Text style={styles.errorMethod}>{log.method}</Text>
                  <Text style={styles.errorUrl} numberOfLines={1}>{log.url}</Text>
                  <Text style={styles.errorStatus}>Status: {log.status}</Text>
                  <Text style={styles.errorTime}>
                    {log.timestamp.toLocaleTimeString()}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Recent Calls */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Recent Calls (Tap for details)</Text>
            {logs.slice(0, 10).map((log) => (
              <TouchableOpacity 
                key={log.id} 
                style={[styles.logItem, !log.success && styles.logItemError]}
                onPress={() => showLogDetails(log)}
              >
                <View style={styles.logHeader}>
                  <Text style={styles.logMethod}>{log.method}</Text>
                  <Text style={styles.logStatus}>
                    {log.success ? '✅' : '❌'} {log.status}
                  </Text>
                </View>
                <Text style={styles.logUrl} numberOfLines={1}>{log.url}</Text>
                <View style={styles.logFooter}>
                  <Text style={styles.logTime}>
                    {log.timestamp.toLocaleTimeString()}
                  </Text>
                  {log.duration && (
                    <Text style={styles.logDuration}>
                      {formatDuration(log.duration)}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleExportLogs}>
            <Text style={styles.actionText}>📤 Export</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.clearButton]} onPress={handleClearLogs}>
            <Text style={styles.actionText}>🗑️ Clear</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: color_1.primary,
    paddingTop: 50,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1f2937',
  },
  healthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  healthDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  healthText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  subText: {
    fontSize: 12,
    color: '#6b7280',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: color_1.primary,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  errorItem: {
    backgroundColor: '#fef2f2',
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
    padding: 12,
    marginBottom: 8,
    borderRadius: 4,
  },
  errorMethod: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#991b1b',
  },
  errorUrl: {
    fontSize: 11,
    color: '#dc2626',
    marginVertical: 2,
  },
  errorStatus: {
    fontSize: 11,
    color: '#7f1d1d',
  },
  errorTime: {
    fontSize: 10,
    color: '#6b7280',
  },
  logItem: {
    backgroundColor: '#f9fafb',
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
    padding: 12,
    marginBottom: 8,
    borderRadius: 4,
  },
  logItemError: {
    backgroundColor: '#fef2f2',
    borderLeftColor: '#ef4444',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  logMethod: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
  },
  logStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  logUrl: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 4,
  },
  logFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logTime: {
    fontSize: 10,
    color: '#9ca3af',
  },
  logDuration: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: color_1.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#ef4444',
  },
  actionText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default DevTools;
