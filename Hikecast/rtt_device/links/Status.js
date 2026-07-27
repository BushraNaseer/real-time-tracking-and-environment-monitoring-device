import {View, Text, StyleSheet} from 'react-native';
import {React} from 'react';

export default function Status({ connectionStatus })
{
    return(
        <View style={styles.container}>
            <Text style={styles.text2}>Bluetooth Connection</Text>
            <Text style={styles.text1}>{connectionStatus}</Text>
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
    text1: {
      fontWeight: 'bold',
      textAlign: 'center',
      fontSize: 20, 
      color: 'black'
    },
    text2: {
      fontWeight: 'bold',
      textAlign: 'center',
      fontSize: 25, 
      color: 'black'
    },
  });

