import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Abstract({ infoArray }) {
    
    const titles = ['Status', 'Temperature and Pressure', 'Change in Atmospheric Pressure', 'My Location Coordinates'];
    
    return (
        <View style={styles.container}>
            {infoArray.map((info, index) => (
                <View key={index} style={styles.box}>
                    <Text style={styles.title}>{titles[index]}</Text>
                    <Text style={styles.text}>{info}</Text>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#c6cbef',
    },
    box: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        width: 300,
        height: 150,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#a52a2a',
    },
    title: {
        fontWeight: 'bold',
        fontSize: 20,
        color: 'black',
    },
    text: {
        fontWeight: 'bold',
        fontSize: 17,
        color: 'black',
    },
});


