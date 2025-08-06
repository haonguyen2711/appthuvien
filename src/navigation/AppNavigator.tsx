import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { color_1 } from '../constants/colors';
import type { AppDispatch, RootState } from '../store';
import LoggerService from '../utils/logger';

// Import screens
import LoginScreen from '../screens/Auth/LoginScreen';
import RegistrationScreen from '../screens/Auth/RegistrationScreen';
import BookDetailScreen from '../screens/Books/BookDetailScreen';
import CategoriesScreen from '../screens/Categories/CategoriesScreen';
import DocumentListScreen from '../screens/Categories/DocumentListScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import ProfileScreenFixed from '../screens/Profile/ProfileScreenFixed';
import ReaderScreen from '../screens/Reader/ReaderScreen';

export type RootStackParamList = {
  Login: undefined;
  Registration: undefined;
  Main: undefined;
  DocumentList: { categoryId: string };
  BookDetail: { bookId: number };
  Reader: { document: any };
};

export type MainTabParamList = {
  Home: undefined;
  Categories: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Main Tab Navigator
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Categories') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: color_1.primary,
        tabBarInactiveTintColor: color_1.textSecondary,
        tabBarStyle: {
          backgroundColor: color_1.surface,
          borderTopColor: color_1.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Trang chủ',
        }}
      />
      <Tab.Screen 
        name="Categories" 
        component={CategoriesScreen}
        options={{
          tabBarLabel: 'Danh mục',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreenFixed}
        options={{
          tabBarLabel: 'Hồ sơ',
        }}
      />
    </Tab.Navigator>
  );
};

// Root Stack Navigator
const AppNavigator = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  LoggerService.log('[AppNavigator] Auth state:', { isAuthenticated, loading });

  useEffect(() => {
    // Auto-login check will be handled by redux-persist rehydration
    // You can add additional auto-login logic here if needed
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isAuthenticated ? "Main" : "Login"}
        screenOptions={{
          headerStyle: {
            backgroundColor: color_1.surface,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: color_1.border,
          },
          headerTintColor: color_1.textPrimary,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
        }}
      >
        {!isAuthenticated ? (
          // Auth Screens
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen 
              name="Registration" 
              component={RegistrationScreen}
              options={{
                title: 'Đăng ký',
                headerShown: true,
              }}
            />
          </>
        ) : (
          // Main App Screens
          <>
            <Stack.Screen 
              name="Main" 
              component={MainTabNavigator}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen 
              name="DocumentList" 
              component={DocumentListScreen}
              options={{
                headerShown: false, // We handle the header in the component
              }}
            />
            <Stack.Screen 
              name="BookDetail" 
              component={BookDetailScreen}
              options={{
                headerShown: false, // We handle the header in the component
              }}
            />
            <Stack.Screen 
              name="Reader" 
              component={ReaderScreen}
              options={{
                headerShown: false, // We handle the header in the component
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
