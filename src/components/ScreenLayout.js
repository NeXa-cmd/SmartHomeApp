// ScreenLayout - Consistent layout wrapper for screens

import { View, StyleSheet, ScrollView } from 'react-native';

const ScreenLayout = ({ children, scrollable = false, style }) => {
  const Container = scrollable ? ScrollView : View;
  
  return (
    <Container 
      style={[styles.container, style]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={scrollable ? styles.scrollContent : undefined}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    flexGrow: 1,
  },
});

export default ScreenLayout;
