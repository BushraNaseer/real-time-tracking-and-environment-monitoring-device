import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

export default function Forecast({ temp_pressure }) {
  const [chartData1, setChartData1] = useState([]);
  const [indicator1, setIndicator1] = useState(null);
  const [chartData2, setChartData2] = useState([]);
  const [indicator2, setIndicator2] = useState(null);
  const [Label, setLabel] = useState([]);

  useEffect(() => {
  if (!temp_pressure) {
    return;
  }
   const matches = temp_pressure.match(/([\d.]+)\s*\*C\s*([\d.]+)\s*hPa/);
   if (matches && matches.length === 3) {
    const temp = parseFloat(matches[1]);
    const pressure = parseFloat(matches[2]);
    const newLabels = Array.from({ length: 60 }, (_, index) => index + 1);
    setLabel(newLabels);
    setChartData1(prevData => [...prevData, { value: temp , label: `${newLabels[prevData.length]} min`}]);
    setIndicator1('Graphical Representation of Temperature');
    setChartData2(prevData => [...prevData, { value: pressure , label: `${newLabels[prevData.length]} min`  }]);
    setIndicator2('Graphical Representation of Atmospheric Pressure');
    }
  }, [temp_pressure]);

return (
  <View style={styles.container}>
    <LineChart
      data={chartData1} // Pass the chart data directly
      color={'#177AD5'}
      thickness={3}
      dataPointsColor={'red'}
    />
    <View>
    {indicator1 && (
    <View style={styles.indicatorContainer}>
    <Text style={styles.indicatorText}>{indicator1}</Text>
    </View>
    )}
    <View style={{ marginBottom: 40 }} />
    </View>
    <LineChart
    data={chartData2} // Pass the chart data directly
    color={'#177AD5'}
    thickness={3}
    dataPointsColor={'red'}
    />
    <View>
    {indicator2 && (
    <View style={styles.indicatorContainer}>
    <Text style={styles.indicatorText}>{indicator2}</Text>
    </View>
  )}
  </View>
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
  indicatorContainer: {
    position: 'top',
    top: -270,
    left: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 2,
    borderRadius: 5,
  },
  indicatorText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
});

