import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, Button, StyleSheet, View } from 'react-native';
import { AuthProvider, useAuth } from './src/auth/AuthContext';
import AdminRecordsScreen from './src/screens/AdminRecordsScreen';
import ClockScreen from './src/screens/ClockScreen';
import LoginScreen from './src/screens/LoginScreen';
import MyRecordsScreen from './src/screens/MyRecordsScreen';

export type RootStackParamList = {
  Login: undefined;
  Clock: undefined;
  MyRecords: undefined;
  AdminRecords: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function Routes() {
  const { token, role, loading, signOut } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {!token ? (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen
            name="Clock"
            component={ClockScreen}
            options={({ navigation }) => ({
              title: 'Ponto Eletrônico',
              headerRight: () => (
                <View style={styles.headerButtons}>
                  <Button
                    title="Histórico"
                    onPress={() => navigation.navigate('MyRecords')}
                  />
                  {role === 'ROLE_MANAGER' && (
                    <Button
                      title="Equipe"
                      onPress={() => navigation.navigate('AdminRecords')}
                    />
                  )}
                  <Button title="Sair" color="#dc2626" onPress={() => signOut()} />
                </View>
              ),
            })}
          />
          <Stack.Screen
            name="MyRecords"
            component={MyRecordsScreen}
            options={{ title: 'Meus registros' }}
          />
          {role === 'ROLE_MANAGER' && (
            <Stack.Screen
              name="AdminRecords"
              component={AdminRecordsScreen}
              options={{ title: 'Registros da equipe' }}
            />
          )}
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Routes />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 4,
  },
});
