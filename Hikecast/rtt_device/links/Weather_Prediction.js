import React from 'react';
import {View, Text, ImageBackground} from 'react-native';

export default function Prediction({ Zforecast }){
 return (
  <View style={{ flex: 1, backgroundColor: '#c6cbef' }}>
   {Zforecast === 'Fine Weather' ? (
    <ImageBackground source={require('../assets/Sunny.jpg')} style={{ flex: 1, resizeMode: 'cover', justifyContent: 'center' }}>
      <Text style={{ color: 'black', fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>Fine Weather Ahead</Text>
    </ImageBackground> 
    ) : Zforecast === 'Fine, Improving' ? (
    <ImageBackground source={require('../assets/Sunny.jpg')} style={{ flex: 1, resizeMode: 'cover', justifyContent: 'center' }}>
      <Text style={{ color: 'black', fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>Fairly Fine, Improving</Text>
    </ImageBackground>  
    ) : Zforecast === 'Fine, Showery Later' ? (
    <ImageBackground source={require('../assets/Sunny_and_Cloudy.jpg')} style={{ flex: 1, resizeMode: 'cover', justifyContent: 'center' }}>
      <Text style={{ color: 'black', fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>Fairly Fine, Showery Later</Text>
    </ImageBackground>  
    ) : Zforecast === 'Unsettled, Improving' ? (
    <ImageBackground source={require('../assets/Cloudy.jpg')} style={{ flex: 1, resizeMode: 'cover', justifyContent: 'center' }}>
      <Text style={{ color: 'black', fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>Unsettled, Probably Improving</Text>
    </ImageBackground>  
    ) : Zforecast === 'Stormy and Rain' ? (
    <ImageBackground source={require('../assets/Stormy.jpg')} style={{ flex: 1, resizeMode: 'cover', justifyContent: 'center' }}>
      <Text style={{ color: 'black', fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>Stormy and Rain</Text>
    </ImageBackground>  
    ) : Zforecast === 'Rain, worse later' ? (
    <ImageBackground source={require('../assets/Cloudy.jpg')} style={{ flex: 1, resizeMode: 'cover', justifyContent: 'center' }}>
      <Text style={{ color: 'black', fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>Rain at time, worse later</Text>
    </ImageBackground>  
    ) : Zforecast === 'Changeable,Some Rain' ? (
    <ImageBackground source={require('../assets/Cloudy.jpg')} style={{ flex: 1, resizeMode: 'cover', justifyContent: 'center' }}>
      <Text style={{ color: 'black', fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>Changeable Some Rain</Text>
    </ImageBackground>  
    ) : (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}> 
        <Text style={{ color: 'black', fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>Predicting Weather...</Text> 
    </View>
    )}
  </View>
  );
}
