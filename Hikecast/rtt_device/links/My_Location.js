import { View, StyleSheet } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import React, { useState, useEffect } from 'react';

export default function My_Location({ lat_long, gps_time_01, received_lat_long, received_time }) {
  const [MyCoordinates, setMyCoordinates] = useState({ latitude: 33.52155592, longitude: 73.17664927 });
  const [PreviousMyCoordinates, setPreviousMyCoordinates] = useState({ latitude: 33.52155592, longitude: 73.17664927 });
  const [ReceivedCoordinates, setReceivedCoordinates] = useState({ latitude: 33.52082868, longitude: 73.17599986 });
  const [PreviousReceivedCoordinates, setPreviousReceivedCoordinates] = useState({ latitude: 33.52082868, longitude: 73.17599986 });
  const [IslamabadCoordinates, setIslamabadCoordinates] = useState({
    latitude: 33.69455, // Islamabad latitude
    longitude: 73.04895, // Islamabad longitude
    latitudeDelta: 0.0922, // Adjust as needed for the initial zoom level
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    if (!lat_long && !gps_time_01) {
      return;
    }
    if (lat_long === "Waiting for Signal") {
      return;
    }
    const matches = lat_long.match(/([\d.]+)\s*([\d.]+)/);
    if (matches && matches.length === 3) {
      const lat = parseFloat(matches[1]);
      const long = parseFloat(matches[2]);
      console.log("Person 1 lat:", lat);
      console.log("Person 1 long:", long);
      setMyCoordinates({ latitude: lat, longitude: long });
      setPreviousMyCoordinates({ latitude: lat, longitude: long });
    } else {
      // Handle the case where lat_long format is incorrect
      console.error('Invalid lat_long format:', lat_long);
    }
  }, [lat_long, gps_time_01]);

  useEffect(() => {
    if (!received_lat_long && !received_time) {
      return;
    }
    const matched = received_lat_long.match(/([\d.]+)\s*([\d.]+)/);
    if (matched && matched.length === 3) {
      const receive_lat = parseFloat(matched[1]);
      const receive_long = parseFloat(matched[2]);
      console.log("Person 2 lat:", receive_lat);
      console.log("Person 2 long:", receive_long);
      setReceivedCoordinates({ latitude: receive_lat, longitude: receive_long });
      setPreviousReceivedCoordinates({ latitude: receive_lat, longitude: receive_long });
    } else {
      // Handle the case where lat_long format is incorrect
      console.error('Invalid lat_long format:', received_lat_long);
    }
  }, [received_lat_long, received_time]);

  useEffect(() => {
    console.log("Person 1 Coordinates", MyCoordinates);
    console.log("Person 2 Coordinates", ReceivedCoordinates);
  }, [MyCoordinates, ReceivedCoordinates]);

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          ...IslamabadCoordinates,
        }}
      >
        <Marker
          coordinate={MyCoordinates}
          title="My Location (ID: 01)"
          description={`GPS Time: ${gps_time_01}`}
        />
        <Marker
          coordinate={ReceivedCoordinates}
          title="Others Location (ID: 02)"
          description={`GPS Time: ${received_time}`}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
