import * as Location from 'expo-location';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { createRecord, RecordType, TimeRecordResponse } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { formatDateTime, RECORD_TYPE_LABELS } from '../format';

const BUTTONS: { type: RecordType; color: string }[] = [
  { type: 'CLOCK_IN', color: '#16a34a' },
  { type: 'BREAK_START', color: '#d97706' },
  { type: 'BREAK_END', color: '#0891b2' },
  { type: 'CLOCK_OUT', color: '#dc2626' },
];

export default function ClockScreen() {
  const { token } = useAuth();
  const [pendingType, setPendingType] = useState<RecordType | null>(null);
  const [lastRecord, setLastRecord] = useState<TimeRecordResponse | null>(null);

  const punch = async (type: RecordType) => {
    if (!token) return;
    setPendingType(type);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Localização necessária',
          'Permita o acesso à localização para registrar o ponto.',
        );
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const record = await createRecord(
        token,
        type,
        position.coords.latitude,
        position.coords.longitude,
      );
      setLastRecord(record);
      Alert.alert(
        'Ponto registrado',
        `${RECORD_TYPE_LABELS[record.type]} às ${formatDateTime(record.recordedAt)}`,
      );
    } catch {
      Alert.alert('Erro', 'Não foi possível registrar o ponto. Tente novamente.');
    } finally {
      setPendingType(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Registrar ponto</Text>
      <Text style={styles.hint}>
        Sua localização será enviada junto com a batida.
      </Text>
      {BUTTONS.map(({ type, color }) => (
        <TouchableOpacity
          key={type}
          style={[styles.button, { backgroundColor: color }, pendingType !== null && styles.buttonDisabled]}
          onPress={() => punch(type)}
          disabled={pendingType !== null}
        >
          {pendingType === type ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{RECORD_TYPE_LABELS[type]}</Text>
          )}
        </TouchableOpacity>
      ))}
      {lastRecord && (
        <View style={styles.lastRecord}>
          <Text style={styles.lastRecordTitle}>Última batida</Text>
          <Text style={styles.lastRecordText}>
            {RECORD_TYPE_LABELS[lastRecord.type]} — {formatDateTime(lastRecord.recordedAt)}
          </Text>
          <Text style={styles.lastRecordCoords}>
            ({lastRecord.latitude.toFixed(5)}, {lastRecord.longitude.toFixed(5)})
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 24,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  hint: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 24,
    marginTop: 4,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  lastRecord: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  lastRecordTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  lastRecordText: {
    fontSize: 15,
    color: '#0f172a',
  },
  lastRecordCoords: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
});
