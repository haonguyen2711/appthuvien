import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import LoggerService from '../../utils/logger';

const TestCategory = () => {
  const categories = useSelector((state: RootState) => state.books.categories);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    LoggerService.log('TestCategory loaded - Categories from Redux:', categories);
  }, [categories, isAuthenticated]);

  return (
    <View style={{ padding: 20, backgroundColor: 'lightblue', margin: 10 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 16, color: 'black' }}>
        🔍 DEBUG - Categories Count: {categories.length}
      </Text>
      <Text style={{ color: 'black' }}>
        🔐 Authenticated: {isAuthenticated ? 'YES' : 'NO'}
      </Text>
      {categories.length === 0 && (
        <Text style={{ color: 'red', fontWeight: 'bold' }}>
          ❌ No categories found in Redux state!
        </Text>
      )}
      {categories.slice(0, 3).map((cat, index) => (
        <Text key={index} style={{ fontSize: 12, color: 'black' }}>
          📚 {cat.title}
        </Text>
      ))}
    </View>
  );
};

export default TestCategory;
