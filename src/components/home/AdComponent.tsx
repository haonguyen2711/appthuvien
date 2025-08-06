import { Image, StyleSheet, Text, View } from 'react-native';
import { color_1 } from '../../constants/colors';
import { Ad } from '../../data/mockData';


export const AdComponent: React.FC<{ item: Ad }> = ({ item }) => (
    <View style={styles.adContainer}>
        <Image source={{ uri: item.image }} style={styles.adImage} />
        <Text style={styles.adTitle}>{item.title}</Text>
    </View>
);

const styles = StyleSheet.create({
  adContainer: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: color_1.surface,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  adImage: {
    width: '100%',
    height: 120,
  },
  adTitle: {
      position: 'absolute',
      bottom: 10,
      left: 10,
      color: color_1.white,
      fontSize: 18,
      fontWeight: 'bold',
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: {width: -1, height: 1},
      textShadowRadius: 10
  }
});
