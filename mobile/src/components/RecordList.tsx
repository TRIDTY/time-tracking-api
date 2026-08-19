import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { TimeRecordResponse } from '../api/client';
import { formatDateTime, RECORD_TYPE_LABELS } from '../format';

interface Props {
  records: TimeRecordResponse[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onEndReached: () => void;
  showUser?: boolean;
}

export default function RecordList({
  records,
  loading,
  refreshing,
  onRefresh,
  onEndReached,
  showUser = false,
}: Props) {
  return (
    <FlatList
      data={records}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={records.length === 0 ? styles.emptyContainer : styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.4}
      ListEmptyComponent={
        loading ? (
          <ActivityIndicator size="large" color="#2563eb" />
        ) : (
          <Text style={styles.emptyText}>Nenhum registro encontrado.</Text>
        )
      }
      ListFooterComponent={
        loading && records.length > 0 ? (
          <ActivityIndicator style={styles.footerSpinner} color="#2563eb" />
        ) : null
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.type}>{RECORD_TYPE_LABELS[item.type]}</Text>
            <Text style={styles.date}>{formatDateTime(item.recordedAt)}</Text>
          </View>
          {showUser && <Text style={styles.user}>{item.userName} (id {item.userId})</Text>}
          <Text style={styles.coords}>
            ({item.latitude.toFixed(5)}, {item.longitude.toFixed(5)})
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 15,
  },
  footerSpinner: {
    marginVertical: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  type: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  date: {
    fontSize: 13,
    color: '#475569',
  },
  user: {
    fontSize: 13,
    color: '#2563eb',
    marginTop: 4,
  },
  coords: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
});
