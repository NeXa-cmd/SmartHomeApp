import { View, StyleSheet, ScrollView, ViewStyle } from 'react-native';
import { ReactNode } from 'react';

interface ScreenLayoutProps {
  children: ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
}

export default function ScreenLayout({ children, scrollable = false, style }: ScreenLayoutProps) {
  const Container = scrollable ? ScrollView : View;
  
  const containerProps = scrollable 
    ? {
        style: [styles.container, style],
        showsVerticalScrollIndicator: false,
        contentContainerStyle: styles.scrollContent
      }
    : {
        style: [styles.container, style]
      };
  
  return (
    <Container {...containerProps}>
      {children}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    flexGrow: 1,
  },
});
