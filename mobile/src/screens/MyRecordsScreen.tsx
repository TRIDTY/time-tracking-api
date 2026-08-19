import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { fetchMyRecords, TimeRecordResponse } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import RecordList from '../components/RecordList';

export default function MyRecordsScreen() {
  const { token } = useAuth();
  const [records, setRecords] = useState<TimeRecordResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const pageRef = useRef(0);
  const lastRef = useRef(false);

  const load = useCallback(
    async (reset: boolean) => {
      if (!token) return;
      const page = reset ? 0 : pageRef.current + 1;
      if (!reset && lastRef.current) return;
      setLoading(true);
      try {
        const result = await fetchMyRecords(token, page);
        pageRef.current = result.number;
        lastRef.current = result.last;
        setRecords((prev) => (reset ? result.content : [...prev, ...result.content]));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useEffect(() => {
    load(true);
  }, [load]);

  return (
    <View style={styles.container}>
      <RecordList
        records={records}
        loading={loading}
        refreshing={refreshing}
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
});
