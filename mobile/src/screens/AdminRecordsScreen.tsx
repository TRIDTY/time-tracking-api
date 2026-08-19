import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { fetchAllRecords, TimeRecordResponse } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import RecordList from '../components/RecordList';

function toInstant(date: string, endOfDay: boolean): string | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return undefined;
  return `${date}T${endOfDay ? '23:59:59' : '00:00:00'}Z`;
}

export default function AdminRecordsScreen() {
  const { token } = useAuth();
  const [records, setRecords] = useState<TimeRecordResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const pageRef = useRef(0);
  const lastRef = useRef(false);

  const load = useCallback(
    async (reset: boolean) => {
      if (!token) return;
      const page = reset ? 0 : pageRef.current + 1;
      if (!reset && lastRef.current) return;
      setLoading(true);
      try {
        const result = await fetchAllRecords(token, {
          page,
          userId: userId.trim() || undefined,
          from: toInstant(fromDate.trim(), false),
          to: toInstant(toDate.trim(), true),
        });
        pageRef.current = result.number;
        lastRef.current = result.last;
        setRecords((prev) => (reset ? result.content : [...prev, ...result.content]));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, userId, fromDate, toDate],
  );

  useEffect(() => {
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <TextInput
          style={styles.input}
          placeholder="ID do funcionário"
          keyboardType="numeric"
          value={userId}
          onChangeText={setUserId}
        />
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.half]}
            placeholder="De (AAAA-MM-DD)"
            value={fromDate}
            onChangeText={setFromDate}
          />
          <TextInput
            style={[styles.input, styles.half]}
            placeholder="Até (AAAA-MM-DD)"
            value={toDate}
            onChangeText={setToDate}
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={() => load(true)}>
          <Text style={styles.buttonText}>Filtrar</Text>
        </TouchableOpacity>
      </View>
      <RecordList
        records={records}
        loading={loading}
        refreshing={refreshing}
        showUser
        onRefresh={() => {
          setRefreshing(true);
          load(true);
        }}
        onEndReached={() => {
          if (!loading) load(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  filters: {
    padding: 16,
    paddingBottom: 0,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  half: {
    flex: 1,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
