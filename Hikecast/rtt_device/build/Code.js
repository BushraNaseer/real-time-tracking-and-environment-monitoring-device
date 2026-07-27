import { PermissionsAndroid} from "react-native"; //for styling app
import { BleManager } from "react-native-ble-plx"; //for ble conncectivity and for providing services
import {useState, useRef, useEffect} from "react"; //core react library for building app user interfaces
import { decode } from "base-64"; //to decode base64-encoded data received from the BLE device

const bleManager = new BleManager(); //Create a new instance of BleManager to manage BLE functionality

const SERVICE_ONE_UUID ="749ad7a7-9f8f-454d-9d88-21e33fb75df9";
const SERVICE_TWO_UUID = "d6160d1f-d7dd-449a-886d-e3fef3d72156";
const SERVICE_THREE_UUID = "cd9b8287-344b-41db-afed-3ca1b8e50b28";
const WEATHER_FORECAST_UUID = "452b8c6e-daa4-4f58-9dfd-a464e77b8e87";
const MY_LOCATION_UUID = "52d77d15-7e71-48a0-b03e-8d09fa10f497";
const GPS_TIME_PERSON_ONE_UUID = "4d0f30ed-995b-4907-bdb8-7e89e0a89865";
const RECEIVED_LOCATION_UUID = "c768dd31-a96f-4654-9d93-23ab549c57d4";
const RECEIVED_TIME_UUID = "65a8e678-2b14-4a40-af3e-2706199fe6d8";
const SEND_SOS_NOTIFICATION_UUID = "74ef8b4d-f169-4102-89f4-c4da251af5d8";
const RECEIVE_ACKNOWLEDGMENT_UUID = "2f2cbf98-3fc0-4467-b1d8-c253628d458f";
const RECEIVE_SOS_NOTIFICATION_UUID = "7f577950-8158-4f1c-8a89-dca3c367e4b7";
const WEATHER_PREDICTION_UUID = "72a90097-309e-4b0e-9406-5aa45bd8af2a";
//Define UUIDs for the BLE service and characteristics

export default function EnvMonitNTracking () {
 const [deviceID, setDeviceID] = useState(null);
 const [temp_pressure, set_temp_pressure] = useState(0); 
 const [lat_long, set_lat_long] = useState(0);
 const [gps_time_01, set_gps_time_01] = useState(null);
 const [received_lat_long, set_received_lat_long] = useState(0);
 const [received_time, set_received_time] = useState(null);
 const [message,set_message] = useState(null);
 const [infoArray, setInfoArray] = useState([]);
 const [connectionStatus, setConnectionStatus] = useState("Searching...");
 const [sendSOSchar, setsendSOSchar] = useState(null);
 const [receiveAck, setreceiveAck] = useState(null);
 const [receiveSOSchar, setreceiveSOSchar] = useState(null);
 const [Zforecast, setZforecast] = useState(null);
 const sos_msg = "HELP, my ID is 01";

 const deviceRef = useRef(null);

   const updateInfoArray = () => {
     setInfoArray([connectionStatus, temp_pressure, message, lat_long]);
    };

  const searchAndConnectToDevice = () => {
    const timeoutId = setTimeout(() => {
      bleManager.stopDeviceScan();
      setConnectionStatus("Device not found");
    }, 50000);

    bleManager.startDeviceScan(null, null, (error, device) => {
      clearTimeout(timeoutId); // Clear the timeout as soon as a device is found or an error occurs
      if (error) {
        console.error(error);
        setConnectionStatus("Error searching for devices");
        return;
      }
      console.log("Discovered device:", device.name, device.id);
      if (device.name === "ESP32_BLE_DEVICE") {
        bleManager.stopDeviceScan();
        setConnectionStatus("Connecting...");
        connectToDevice(device);
      }
    });
  };

  useEffect(() => {
    const requestLocationPermission= async () => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          {
            title: "Location permission for bluetooth scanning",
            message:
              "Grant location permission to allow the app to scan for Bluetooth devices",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log("Location permission for bluetooth scanning granted");
        } else {
          console.log("Location permission for bluetooth scanning denied");
        }
      } catch (err) {
        console.warn(err);
      }
    };
    
    requestLocationPermission();
    searchAndConnectToDevice();
  }, []);

  const connectToDevice = (device) => {
    // Log initial connection attempt
    console.log("Attempting to connect to device:", device.name, device.id);
    if (deviceRef.current && deviceRef.current.isConnected()) {
      console.log("Device is already connected.");
      //return Promise.resolve(deviceRef.current);
    }
    return device.connect()
      .then((connectedDevice) => {
        // Log successful connection
        console.log("Connected to device:", connectedDevice.id);
        setDeviceID(connectedDevice.id);
        setConnectionStatus("Connected");
        deviceRef.current = connectedDevice;
        return connectedDevice.discoverAllServicesAndCharacteristics();
      })
      .then((connectedDevice) => connectedDevice.services())
      .then(async(services) => {
        // Log services information
        console.log("Discovered services:", services.map(service => service.uuid));
        let service_one = services.find((service) => service.uuid === SERVICE_ONE_UUID);
        let service_two = services.find((service) => service.uuid === SERVICE_TWO_UUID);
        let service_three = services.find((service) => service.uuid === SERVICE_THREE_UUID);

        if (!service_one && !service_two) {
          throw new Error("Service not found on the device");
        }
        const serviceOneCharacteristics = await service_one.characteristics();
        const serviceTwoCharacteristics = await service_two.characteristics();
        const serviceThreeCharacteristics = await service_three.characteristics();

        return [serviceOneCharacteristics, serviceTwoCharacteristics, serviceThreeCharacteristics];
      })
      .then((characteristics) => {
        // Log characteristics information
        const [serviceOneCharacteristics, serviceTwoCharacteristics, serviceThreeCharacteristics] = characteristics;
        console.log("Discovered characteristics:", [...serviceOneCharacteristics, ...serviceTwoCharacteristics, ...serviceThreeCharacteristics].map(char => char.uuid));
        let temp_pressure_characteristic = serviceOneCharacteristics.find((char) => char.uuid === WEATHER_FORECAST_UUID);
        let lat_long_characteristic = serviceOneCharacteristics.find((char) => char.uuid === MY_LOCATION_UUID);
        let gps_time_01_characteristic = serviceOneCharacteristics.find((char) => char.uuid == GPS_TIME_PERSON_ONE_UUID);
        let received_lat_long_characteristic = serviceOneCharacteristics.find((char) => char.uuid == RECEIVED_LOCATION_UUID);
        let received_time_characteristic = serviceTwoCharacteristics.find((char) => char.uuid == RECEIVED_TIME_UUID);
        let send_sos_msg_characteristic = serviceTwoCharacteristics.find((char) => char.uuid == SEND_SOS_NOTIFICATION_UUID);
        let send_ack_msg_characteristic = serviceTwoCharacteristics.find((char) => char.uuid == RECEIVE_ACKNOWLEDGMENT_UUID);
        let receive_sos_msg_characteristic = serviceTwoCharacteristics.find((char) => char.uuid == RECEIVE_SOS_NOTIFICATION_UUID);
        let prediction_characteristic = serviceThreeCharacteristics.find((char) => char.uuid == WEATHER_PREDICTION_UUID);

        if (!temp_pressure_characteristic) {
          console.error("Characteristics details:", temp_pressure_characteristic);
          throw new Error("Characteristic not found on the device");
        }
        
        let previous_pressure=0;
        let current_pressure=0;
        
        temp_pressure_characteristic.monitor((error, char) => {
          console.log("Monitoring callback triggered.");
          if (error) {
            console.error("Error during monitoring:", error);
            return;
          }
          console.log("Received weather updates (raw):", char.value);
          try {
            const decodedData = decode(char.value);
            console.log("Received weather updates (decoded):", decodedData);
            set_temp_pressure(decodedData);
            const pressure_match = decodedData.match(/(?<=C\s*)[\d.]+\s*hPa/);
            const pressure = parseFloat(pressure_match);
            const time_interval = 1; //1 min gap between previous and current pressure
            if (pressure !=null){
              console.log("Previous Pressure: ", previous_pressure);
              current_pressure=pressure;
              console.log("Current Pressure: ", pressure);
              const pressure_change = current_pressure-previous_pressure;
              const slope = (pressure_change/time_interval);
              set_message(slope);
              previous_pressure=current_pressure;
            } 
          } catch (decodeError) {
            console.error("Error decoding data:", decodeError);
          }
        });

        if (!prediction_characteristic) {
          console.error("Characteristic details:", prediction_characteristic);
          throw new Error("Characteristic not found on the device");
        }
        
        prediction_characteristic.monitor((error, char) => {
          console.log("Monitoring callback triggered.");
          if (error) {
            console.error("Error during monitoring:", error);
            return;
          }
          console.log("Received Forecast (raw):", char.value);
          try{
            const decoded_DATA = decode(char.value);
            console.log("Received Forecast (decoded):", decoded_DATA);
            setZforecast(decoded_DATA);
          }
          catch (decodeError) {
            console.error("Error decoding data:", decodeError);
          }
        });

        if (!lat_long_characteristic) {
          console.error("Characteristics details:", lat_long_characteristic);
          throw new Error("Characteristic not found on the device");
        }
        
        lat_long_characteristic.monitor((error, char) => {
          console.log("Monitoring callback triggered.");
          if (error) {
            console.error("Error during monitoring:", error);
            return;
          }
          console.log("Received my location updates (raw):", char.value);
          try {
            const DecodedData = decode(char.value);
            console.log("Received my location updates (decoded):", DecodedData);
            set_lat_long(DecodedData);
          } catch (decodeError) {
            console.error("Error decoding data:", decodeError);
          }
        });

        if (!gps_time_01_characteristic) {
          console.error("Characteristic details:", gps_time_01_characteristic);
          throw new Error("Characteristic not found on the device");
        }

        gps_time_01_characteristic.monitor((error, char) => {
          console.log("Monitoring callback triggered.");
          if (error) {
            console.error("Error during monitoring:", error);
            return;
          }
          console.log("Received GPS Time for Person No.1-My Location (raw):", char.value);
          try{
            const decodeddata = decode(char.value);
            console.log("Received GPS Time for Person No.1-My Location (decoded):", decodeddata);
            set_gps_time_01(decodeddata);
          }
          catch (decodeError) {
            console.error("Error decoding data:", decodeError);
          }
        });

        if (!received_lat_long_characteristic) {
          console.error("Characteristic details:", received_lat_long_characteristic);
          throw new Error("Characteristic not found on the device");
        }

        received_lat_long_characteristic.monitor((error, char) => {
          console.log("Monitoring callback triggered.");
          if (error) {
            console.error("Error during monitoring:", error);
            return;
          }
          console.log("Received GPS Coordinates for Person No.2- Others Location (raw):", char.value);
          try{
            const decodedata = decode(char.value);
            console.log("Received GPS Coordinates for Person No.2- Others Location (decoded):", decodedata);
            set_received_lat_long(decodedata);
          }
          catch (decodeError) {
            console.error("Error decoding data:", decodeError);
          }
        });

        if (!received_time_characteristic) {
          console.error("Characteristic details:", received_time_characteristic);
          throw new Error("Characteristic not found on the device");
        }

        received_time_characteristic.monitor((error, char) => {
          console.log("Monitoring callback triggered.");
          if (error) {
            console.error("Error during monitoring:", error);
            return;
          }
          console.log("Received Time for Person No.2- Others Location (raw):", char.value);
          try{
            const decode_data = decode(char.value);
            console.log("Received Time for Person No.2- Others Location (decoded):", decode_data);
            set_received_time(decode_data);
          }
          catch (decodeError) {
            console.error("Error decoding data:", decodeError);
          }
        });

        if (!send_sos_msg_characteristic) {
          console.error("Characteristic details:", send_sos_msg_characteristic);
          throw new Error("Characteristic not found on the device");
        }
        else {
          setsendSOSchar(send_sos_msg_characteristic);
          console.log("Value of sendSOSchar: ", sendSOSchar);
        }

        if (!send_ack_msg_characteristic) {
          console.error("Characteristic details:", send_ack_msg_characteristic);
          throw new Error("Characteristic not found on the device");
        }
        else {
          setreceiveAck(send_ack_msg_characteristic);
          console.log("Value of receiveAck: ", receiveAck);
        }

        if (!receive_sos_msg_characteristic) {
          console.error("Characteristic details:", receive_sos_msg_characteristic);
          throw new Error("Characteristic not found on the device");
        }
        
        receive_sos_msg_characteristic.monitor((error, char) => {
          console.log("Monitoring callback triggered.");
          if (error) {
            console.error("Error during monitoring:", error);
            return;
          }
          console.log("Received Help Msg Person No.2 (raw):", char.value);
          try{
            const decoded_sos_msg = decode(char.value);
            console.log("Received Help Msg Person No.2(decoded):", decoded_sos_msg);
            setreceiveSOSchar(decoded_sos_msg);
          }
          catch (decodeError) {
            console.error("Error decoding data:", decodeError);
          }
        });
      })
      .catch((error) => {
        // Log any errors during the connection process
        console.error("Error discovering services and characteristics:", error);
        setConnectionStatus("Error discovering services and characteristics");
      });
  };
 
  useEffect(() => {
    const subscription = bleManager.onDeviceDisconnected(
      deviceID,
      (error, device) => {
        if (error) {
          console.log("Disconnected with error:", error);
        }
        setConnectionStatus("Disconnected");
        console.log("Disconnected device");
        set_temp_pressure(0); 
        if (deviceRef.current) {
          setConnectionStatus("Reconnecting...");
          connectToDevice(deviceRef.current)
            .then(() => setConnectionStatus("Connected"))
            .catch((error) => {
              console.log("Reconnection failed: ", error);
              setConnectionStatus("Reconnection failed");
            });
        }
      }
    );
    return () => subscription.remove();
  }, [deviceID]);

  useEffect(() => {
    // Update the info array whenever any of the values change
    updateInfoArray();
  }, [connectionStatus, temp_pressure, message, lat_long]);

  useEffect(() => {
    console.log("Value of sendSOSchar:", sendSOSchar);
  }, [sendSOSchar]); // This will log the value of sendSOSchar whenever it changes

  useEffect(() => {
    console.log("Value of receiveAck:", receiveAck);
  }, [receiveAck]); // This will log the value of receiveAck whenever it changes

  return {connectionStatus, temp_pressure, message, lat_long, gps_time_01, received_lat_long, received_time, infoArray, sendSOSchar, sos_msg, receiveAck, receiveSOSchar, Zforecast};
}
