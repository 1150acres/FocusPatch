import React from 'react';
import { View, Text } from 'react-native';
import { format, addDays } from 'date-fns';

export default function DayColumn({ dateOffset = 0 }) {
  const date = addDays(new Date(), dateOffset);
  
  return (
    <View style={{width: '25%', borderRightWidth: 1, borderColor: '#e0e0e0', padding: 8}}>
      <Text style={{fontWeight: 'bold', textAlign: 'center', marginBottom: 8}}>
        {format(date, 'EEE, MMM d')}
      </Text>
      {/* Placeholder for tasks */}
      <View style={{backgroundColor: '#e6f2ff', padding: 8, borderRadius: 8, marginBottom: 8}}>
        <Text>Sample task</Text>
      </View>
    </View>
  );
} 