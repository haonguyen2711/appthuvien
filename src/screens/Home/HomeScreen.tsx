import React, { useEffect, useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import ErrorDisplay from '../../components/common/ErrorDisplay';
import SearchBar from '../../components/common/SearchBar';
import DevTools from '../../components/dev/DevTools';
import { canUseApiMonitor, canUseApiTesting, canUseErrorTesting, secureError } from '../../config/debugConfig';
import { color_1 } from '../../constants/colors';
import { Ad, ads_data, categories_data, Category } from '../../data/mockData';
import type { AppDispatch, RootState } from '../../store';
import { fetchBooks } from '../../store/slices/bookSlice';

// Conditional imports for debug features
const testApiConnection = canUseApiTesting() ? require('../../utils/apiTest').testApiConnection : null;
const runAllErrorTests = canUseErrorTesting() ? require('../../utils/errorTesting').runAllErrorTests : null;

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [apiTestError, setApiTestError] = useState<any>(null);
  const [showDevTools, setShowDevTools] = useState(false);
  
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { books, loading, error } = useSelector((state: RootState) => state.books);
  
  const isVip = user?.role === 'VIP' || user?.role === 'ADMIN';

  useEffect(() => {
    // Fetch latest books on component mount
    dispatch(fetchBooks({ page: 0, size: 10, sort: 'createdAt,desc' }));
  }, [dispatch]);

  const handleApiTest = async () => {
    if (!canUseApiTesting() || !testApiConnection) {
      return;
    }
    try {
      setApiTestError(null);
      await testApiConnection();
    } catch (error) {
      setApiTestError(error);
    }
  };

  const handleErrorTest = async () => {
    if (!canUseErrorTesting() || !runAllErrorTests) {
      return;
    }
    try {
      await runAllErrorTests();
    } catch (error) {
      secureError('Error testing failed:', error);
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    navigation.navigate('DocumentList', { categoryId });
  };

  const renderFeaturedCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.featuredCategoryCard}
      onPress={() => handleCategoryPress(item.id)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.categoryImage} />
      <Text style={styles.categoryTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderAd = ({ item }: { item: Ad }) => (
    <View style={styles.adContainer}>
      <Image source={{ uri: item.image }} style={styles.adImage} />
      <Text style={styles.adTitle}>{item.title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          {/* Thanh tìm kiếm */}
          <SearchBar 
            value={searchText} 
            onChangeText={setSearchText}
            placeholder="Tìm kiếm tài liệu..."
          />

          {/* Development Tools - HOÀN TOÀN TẮT TRONG PRODUCTION */}
          {(canUseApiTesting() || canUseErrorTesting() || canUseApiMonitor()) && (
            <View>
              <View style={styles.devToolsContainer}>
                {canUseApiTesting() && (
                  <TouchableOpacity 
                    style={styles.testButton} 
                    onPress={handleApiTest}
                  >
                    <Text style={styles.testButtonText}>🔗 Test API</Text>
                  </TouchableOpacity>
                )}
                
                {canUseErrorTesting() && (
                  <TouchableOpacity 
                    style={styles.errorTestButton} 
                    onPress={handleErrorTest}
                  >
                    <Text style={styles.testButtonText}>🧪 Test Errors</Text>
                  </TouchableOpacity>
                )}
                
                {canUseApiMonitor() && (
                  <TouchableOpacity 
                    style={styles.devToolsButton} 
                    onPress={() => setShowDevTools(true)}
                  >
                    <Text style={styles.testButtonText}>🔧 Monitor</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {canUseApiTesting() && apiTestError && (
                <ErrorDisplay 
                  error={apiTestError}
                  onRetry={handleApiTest}
                  showDetails={true}
                  style={styles.errorContainer}
                />
              )}
            </View>
          )}

          {/* Quảng cáo cho tài khoản thường */}
          {!isVip && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Ưu đãi đặc biệt</Text>
              <FlatList
                data={ads_data}
                renderItem={renderAd}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              />
            </View>
          )}

          {/* Danh mục nổi bật */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Thể loại nổi bật</Text>
            <FlatList
              data={categories_data.slice(0, 6)} // Hiển thị 6 danh mục đầu tiên
              renderItem={renderFeaturedCategory}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>

          {/* Xem tất cả danh mục */}
          <View style={styles.sectionContainer}>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('Categories')}
            >
              <Text style={styles.viewAllText}>Xem tất cả danh mục</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      {/* DevTools Modal - HOÀN TOÀN TẮT TRONG PRODUCTION */}
      {canUseApiMonitor() && (
        <DevTools 
          visible={showDevTools} 
          onClose={() => setShowDevTools(false)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color_1.background,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  sectionContainer: {
    marginTop: 25,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: color_1.textPrimary,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  horizontalList: {
    paddingHorizontal: 20,
  },
  featuredCategoryCard: {
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: color_1.surface,
    shadowColor: color_1.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    width: 140,
  },
  categoryImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: color_1.textPrimary,
    textAlign: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  adContainer: {
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: color_1.surface,
    shadowColor: color_1.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    width: 280,
  },
  adImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  adTitle: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    color: color_1.white,
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  viewAllButton: {
    backgroundColor: color_1.primary,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewAllText: {
    color: color_1.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  testButton: {
    backgroundColor: color_1.warning,
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: color_1.white,
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    marginHorizontal: 20,
    marginTop: 10,
  },
  devToolsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 10,
    gap: 8,
  },
  errorTestButton: {
    backgroundColor: '#ef4444',
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  devToolsButton: {
    backgroundColor: '#6366f1',
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});

export default HomeScreen;
