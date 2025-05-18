import { View, Text } from 'react-native';

export default function GoalItem({ title, completed, total }) {
  return (
    <View style={{marginBottom: 16}}>
      <Text style={{fontWeight: 'bold', marginBottom: 4}}>{title}</Text>
      <View style={{height: 8, backgroundColor: '#e0e0e0', borderRadius: 4}}>
        <View 
          style={{
            height: 8, 
            backgroundColor: '#3498db', 
            borderRadius: 4, 
            width: `${(completed / total) * 100}%`
          }} 
        />
      </View>
      <Text style={{fontSize: 12, color: '#666', marginTop: 4}}>
        {completed}/{total} steps
      </Text>
    </View>
  );
} 