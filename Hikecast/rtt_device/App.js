import 'react-native-gesture-handler';
import 'react-native-reanimated';
import EnvMonitNTracking from './build/Code';
import Status from './links/Status';
import Forecast from './links/Forecast';
import Pressure_Slope from './links/Pressure_Slope';
import Abstract from './links/Abstract';
import My_Location from './links/My_Location';
import SOS_Notify from './links/SOS';
import Prediction from './links/Weather_Prediction';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {Alert, Image, StyleSheet, View} from 'react-native';

const Drawer = createDrawerNavigator();

export default function App() {
  const { connectionStatus, temp_pressure, message, lat_long, gps_time_01 , received_lat_long, received_time, infoArray, sendSOSchar, sos_msg, receiveAck, receiveSOSchar, Zforecast } = EnvMonitNTracking();
  const [appIsReady, setAppIsReady] = useState(false); // State to track app loading status

  // useEffect to display a popup whenever receiveSOSchar changes
  useEffect(() => {
    if (receiveSOSchar) {
      Alert.alert(
        'SOS Message Received',
        receiveSOSchar, 
        [
          { text: 'OK', onPress: () => console.log('OK Pressed') },
        ],
        { cancelable: true }
      );
    }
  }, [receiveSOSchar]); // Run this effect whenever receiveSOSchar changes

  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setAppIsReady(true); // Mark app as ready after 5 seconds
    }, 5000); // Adjust the timeout as needed
    return () => clearTimeout(loadingTimeout);
  }, []);

  if (!appIsReady) {
    // Display the splash screen until app loading is complete
    return (
      <View style={styles.container}>
        <Image
          source={require('./links/splash_screen.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Drawer.Navigator
        screenOptions={{
          drawerStyle: {
            backgroundColor: '#c6cbef',
            width: 240,
          },
        }}>
        <Drawer.Screen name="Summary">
          {(props) => <Abstract {...props} infoArray={infoArray} />}
        </Drawer.Screen>
        <Drawer.Screen name="BLE Status">
          {(props) => <Status {...props} connectionStatus={connectionStatus} />}
        </Drawer.Screen>
        <Drawer.Screen name="Temp and Pressure">
          {(props) => <Forecast {...props} temp_pressure={temp_pressure} />}
        </Drawer.Screen>
        <Drawer.Screen name="Change in Ambient Pressure">
          {(props) => <Pressure_Slope {...props} message={message} />}
        </Drawer.Screen>
        <Drawer.Screen name="Weather Prediction">
          {(props) => <Prediction {...props} Zforecast={Zforecast} />}
        </Drawer.Screen>
        <Drawer.Screen name="Track Location">
          {(props) => <My_Location {...props} lat_long={lat_long} gps_time_01={gps_time_01} received_lat_long={received_lat_long} received_time={received_time} />}
        </Drawer.Screen>
        <Drawer.Screen name="Help">
          {(props) => <SOS_Notify {...props} sendSOSchar={sendSOSchar} sos_msg={sos_msg} receiveAck={receiveAck} />}
        </Drawer.Screen>
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#c6cbef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
