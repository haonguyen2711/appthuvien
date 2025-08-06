
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { Document } from '../data/mockData';
import CategoriesScreen from '../screens/Categories/CategoriesScreen';
import DocumentListScreen from '../screens/Categories/DocumentListScreen';
import ReaderScreen from '../screens/Reader/ReaderScreen';


export type CategoryStackParamList = {
  Categories: undefined;
  DocumentList: {
    categoryId: string;
    categoryTitle: string;
  };
  //new
  Reader: {
    document: Document;
  };
};

const Stack = createStackNavigator<CategoryStackParamList>();

const CategoryNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen name="DocumentList" component={DocumentListScreen} />
      <Stack.Screen name="Reader" component={ReaderScreen} /> 
    </Stack.Navigator>
  );
};

export default CategoryNavigator;
