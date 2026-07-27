import { TouchableOpacity, Text, View, ImageBackground} from 'react-native';
import React, { useState } from 'react'; // Corrected import for React
import { encode, decode } from "base-64"; //to decode base64-encoded data received from the BLE device

export default function SOS_Notify({ sendSOSchar, sos_msg, receiveAck }) {
  const [Ack_Msg, Set_Ack_Msg] = useState(null);

  const handleEmergencyButtonPress = () => {
    console.log("Emergency help button pressed");
    try {
      if (!sendSOSchar) {
        console.error("Characteristic is undefined. Aborting SOS message send.");
        return;
      }
      const encodedSOSMsg = encode(sos_msg); // Encode SOS message using Base64
      sendSOSchar.writeWithResponse(encodedSOSMsg);
      console.log("SOS message sent successfully:", sos_msg);
      if (receiveAck) {
        receiveAck.monitor((error, char) => {
        console.log("Monitoring acknowledgment callback triggered.");
        if (error) {
          console.error("Error during monitoring:", error);
          return;
        }
        console.log("Received acknowledgment message (raw):", char.value);
        try {
          const DecodedAck = decode(char.value);
          console.log("Received acknowledgment message (decoded):", DecodedAck);
          Set_Ack_Msg(DecodedAck);
        } catch (decodeError) {
          console.error("Error decoding data:", decodeError);
        }
        });
      } else {
        console.log("receiveAck variable is empty.")
      }
    } catch (error) {
      console.error("Error sending SOS message:", error);
    }
  };

  return (
    <ImageBackground source={require('../assets/sos_image.jpg')} style={{flex: 1, resizeMode: 'cover', justifyContent: 'center', alignItems: 'center'}}>
      <View style={{ flex: 1, justifyContent: 'top', alignItems: 'center' }}>
        <TouchableOpacity
          style={{ backgroundColor: 'red', padding: 20, margin: 20, borderRadius: 5 }}
          onPress={handleEmergencyButtonPress}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>For EMERGENCY Help Click Here</Text>
        </TouchableOpacity>
        {Ack_Msg && ( 
          <View style={{ flex: 1, justifyContent: 'top', alignItems: 'center' }}>
          <Text style={{ color: 'black', fontWeight: 'bold', textAlign: 'center', fontSize: 20 }}>{Ack_Msg}</Text>
          </View>
        )}
      </View>
    </ImageBackground>
  );
}
