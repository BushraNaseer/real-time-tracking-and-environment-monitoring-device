import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

export default function Pressure_Slope({ message }) {
  const [chartData, setChartData] = useState([]);
  const [Label, setLabel] = useState([]);

  useEffect(() => {
    const newLabels = Array.from({ length: 60 }, (_, index) => index + 1);
    setLabel(newLabels);
    setChartData(prevData => [...prevData, {value: message, label: `${newLabels[prevData.length]} min`} ]);
  }, [message]);

  return (
    <View style={styles.container}>
      <LineChart
        data={chartData} // Pass the chart data directly
        color={'#177AD5'}
        thickness={3}
        dataPointsColor={'red'}
      />
      <Text style={styles.bottomIndicator}>
        Graph shows the Change in Atmospheric Pressure 
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#c6cbef',
  },
  bottomIndicator: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});
