import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import mangaDXService from '../../services/mangaDXService';

interface ApiTestProps {
  visible: boolean;
  onClose: () => void;
}

const ApiTest: React.FC<ApiTestProps> = ({ visible, onClose }) => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const addLog = (message: string) => {
    console.log('🧪 ApiTest:', message);
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testMangaDX = async () => {
    setTesting(true);
    setTestResults([]);
    
    try {
      addLog('Starting MangaDX tests...');

      // Test 1: Categories
      addLog('Testing categories...');
      try {
        const categories = await mangaDXService.getCategories();
        addLog(`✅ Categories: ${categories.length} found`);
        console.log('Categories data:', categories);
      } catch (error) {
        addLog(`❌ Categories failed: ${error}`);
      }

      // Test 2: Manga
      addLog('Testing manga...');
      try {
        const manga = await mangaDXService.getPopularManga(5);
        addLog(`✅ Manga: ${manga.length} found`);
        console.log('Manga data:', manga);
      } catch (error) {
        addLog(`❌ Manga failed: ${error}`);
      }

      // Test 3: Tags
      addLog('Testing tags...');
      try {
        const tags = await mangaDXService.getTags();
        addLog(`✅ Tags: ${tags.length} found`);
        console.log('Tags data:', tags.slice(0, 5));
      } catch (error) {
        addLog(`❌ Tags failed: ${error}`);
      }

      addLog('All tests completed!');
    } catch (error) {
      addLog(`❌ General error: ${error}`);
    } finally {
      setTesting(false);
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>API Test Debug</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          onPress={testMangaDX} 
          style={[styles.testButton, testing && styles.testButtonDisabled]}
          disabled={testing}
        >
          <Text style={styles.testButtonText}>
            {testing ? 'Testing...' : 'Test MangaDX APIs'}
          </Text>
        </TouchableOpacity>

        <ScrollView style={styles.logContainer}>
          {testResults.map((result, index) => (
            <Text key={index} style={styles.logText}>{result}</Text>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: 'white',
    width: '90%',
    maxHeight: '80%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#3498db',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  testButton: {
    margin: 15,
    padding: 15,
    backgroundColor: '#2ecc71',
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logContainer: {
    flex: 1,
    maxHeight: 300,
    margin: 15,
    marginTop: 0,
  },
  logText: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 5,
    color: '#2c3e50',
  },
});

export default ApiTest;
