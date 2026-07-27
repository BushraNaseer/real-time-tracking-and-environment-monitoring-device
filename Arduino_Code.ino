#include <TinyGPS++.h>
#include <Wire.h>
#include <TimeLib.h>
#include <math.h>
#include <Adafruit_BMP280.h>
#include <SPI.h>
#include <nRF24L01.h>
#include <RF24.h>

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#define GPS_BAUDRATE 9600
TinyGPSPlus gps;
Adafruit_BMP280 bmp280;
#define BMP_SDA 21
#define BMP_SCL 22
RF24 radio(4, 5);
int counter = 0;
const uint64_t pipe_address = 0xF0F0F0F0E1LL;
int timeZoneOffset = 5; // PKT is UTC+05:00
bool sosMessageTransmitted = false; // Initialize flag to false
float prev_pressure = 0; // Variable to store previous pressure value
unsigned long prev_time = 0; // Variable to store previous time
String prediction;

#define SERVICE_ONE_UUID "749ad7a7-9f8f-454d-9d88-21e33fb75df9" 
#define WEATHER_FORECAST_UUID "452b8c6e-daa4-4f58-9dfd-a464e77b8e87"
#define GPS_DATA_UUID "52d77d15-7e71-48a0-b03e-8d09fa10f497" 
#define GPS_TIME_UUID "4d0f30ed-995b-4907-bdb8-7e89e0a89865"
#define RF_RECEIVED_GPS_UUID "c768dd31-a96f-4654-9d93-23ab549c57d4"

#define SERVICE_TWO_UUID "d6160d1f-d7dd-449a-886d-e3fef3d72156"
#define RF_RECEIVED_GPS_TIME_UUID "65a8e678-2b14-4a40-af3e-2706199fe6d8"
#define SOS_BUTTON_PRESSED_UUID "74ef8b4d-f169-4102-89f4-c4da251af5d8"
#define SEND_ACKNOWLEDGMENT_UUID "2f2cbf98-3fc0-4467-b1d8-c253628d458f"
#define RECEIVE_SOS_NOTIFICATION_UUID "7f577950-8158-4f1c-8a89-dca3c367e4b7"

#define SERVICE_THREE_UUID "cd9b8287-344b-41db-afed-3ca1b8e50b28"
#define WEATHER_PREDICTION_UUID "72a90097-309e-4b0e-9406-5aa45bd8af2a"

BLEServer* pServer = NULL; 
BLECharacteristic* pCharacteristicTempPressure = NULL; // Temperature and Pressure Characteristic
BLECharacteristic* pCharacteristicGPS = NULL; // GPS Characteristic
BLECharacteristic* pCharacteristicGPSTime = NULL; // GPS Time Characteristic
BLECharacteristic* pCharacteristicReceiveGPS = NULL; //RF GPS Coordinates Receiver Characteristic
BLECharacteristic* pCharacteristicReceiveTime = NULL; //RF GPS Time Receiver Characteristic
BLECharacteristic* pCharacteristicSOS = NULL; //RF SOS Transmit Characteristic
BLECharacteristic* pCharacteristicSOSAck = NULL; //SOS Acknowledgment Characteristic
BLECharacteristic* pCharacteristicReceiveNotification = NULL; //Receiving sos notification over RF
BLECharacteristic* pCharacteristicPrediction = NULL; // weather prediction over BLE

BLEAdvertising *pAdvertising = NULL;

void setup() {
  Serial.begin(9600);
  Serial2.begin(GPS_BAUDRATE);
  radio.begin();
  radio.setPALevel(RF24_PA_LOW);
  radio.setDataRate(RF24_250KBPS);
  boolean status = bmp280.begin(0x76);
  if (!status) {
    Serial.println("Not connected");
  }
   // Set sampling parameters
  bmp280.setSampling(Adafruit_BMP280::MODE_NORMAL,     // Set normal mode
                     Adafruit_BMP280::SAMPLING_X2,     // Temperature oversampling x 2
                     Adafruit_BMP280::SAMPLING_X16,    // Pressure oversampling x 16(give high resolution)
                     Adafruit_BMP280::FILTER_X16,      // Filter coefficient x 16(16 means max filtering 
                     Adafruit_BMP280::STANDBY_MS_500); // Standby time 500 ms
  BLEDevice::init("ESP32_BLE_DEVICE");
  pServer = BLEDevice::createServer(); 
  BLEService *pService_One = pServer->createService(SERVICE_ONE_UUID);
  
  pCharacteristicTempPressure = pService_One->createCharacteristic(WEATHER_FORECAST_UUID, BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY);
  pCharacteristicTempPressure->addDescriptor(new BLE2902()); 

  pCharacteristicGPS = pService_One->createCharacteristic(GPS_DATA_UUID, BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY);
  pCharacteristicGPS->addDescriptor(new BLE2902()); 

  pCharacteristicGPSTime = pService_One->createCharacteristic(GPS_TIME_UUID, BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY);
  pCharacteristicGPSTime->addDescriptor(new BLE2902()); 

  pCharacteristicReceiveGPS = pService_One->createCharacteristic(RF_RECEIVED_GPS_UUID, BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY);
  pCharacteristicReceiveGPS->addDescriptor(new BLE2902()); 

  BLEService *pService_Two = pServer->createService(SERVICE_TWO_UUID);

  pCharacteristicReceiveTime = pService_Two->createCharacteristic(RF_RECEIVED_GPS_TIME_UUID, BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY);
  pCharacteristicReceiveTime->addDescriptor(new BLE2902());

  pCharacteristicSOS = pService_Two->createCharacteristic(SOS_BUTTON_PRESSED_UUID, BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_NOTIFY );
  pCharacteristicSOS->addDescriptor(new BLE2902());

  pCharacteristicSOSAck = pService_Two->createCharacteristic(SEND_ACKNOWLEDGMENT_UUID, BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY );
  pCharacteristicSOSAck->addDescriptor(new BLE2902());

  pCharacteristicReceiveNotification = pService_Two->createCharacteristic(RECEIVE_SOS_NOTIFICATION_UUID, BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY );
  pCharacteristicReceiveNotification->addDescriptor(new BLE2902());
  
  BLEService *pService_Three = pServer->createService(SERVICE_THREE_UUID);

  pCharacteristicPrediction = pService_Three->createCharacteristic(WEATHER_PREDICTION_UUID, BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY);
  pCharacteristicPrediction->addDescriptor(new BLE2902()); 

  pService_One->start(); // Start the first service
  pService_Two->start(); // Start the second service
  pService_Three->start(); // Start the third service
  pAdvertising = BLEDevice::getAdvertising(); 

  // Add both service UUIDs to the advertising data
  pAdvertising->addServiceUUID(SERVICE_ONE_UUID);
  pAdvertising->addServiceUUID(SERVICE_TWO_UUID);
  pAdvertising->addServiceUUID(SERVICE_THREE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);
  pAdvertising->setMinPreferred(0x12);

  BLEDevice::startAdvertising();
  Serial.println("BLE device is ready to be connected");
}

void env_gps_rf_transceiver() {
 if (Serial2.available() > 0) {
  if (gps.encode(Serial2.read())) {
   float temp = bmp280.readTemperature();
   float pressure = (bmp280.readPressure()/100);
   float Altitude = gps.altitude.isValid() ? gps.altitude.meters() : 0.0; 
   unsigned long current_time = millis();
   float dt = (current_time - prev_time) / 1000.0; // Convert milliseconds to seconds
   float pressure_derivative = (pressure - prev_pressure) / dt;
   prev_pressure = pressure;
   prev_time = current_time;
   String dataToSend = String(temp)+ " *C "+ String(pressure) + " hPa ";
   Serial.println(dataToSend);
   pCharacteristicTempPressure->setValue(dataToSend.c_str());
   pCharacteristicTempPressure->notify();
   if (Altitude > 0){
   weatherPrediction(pressure_derivative, temp, pressure, Altitude);
   }
   else {
   Serial.println("Invalid Altitude. No weather prediction performed.");
   }
  if (gps.location.isValid()) {
   float latitude = gps.location.lat();
   float longitude = gps.location.lng();
   String gpsData = String(latitude,6) +  " " + String(longitude,6);
   Serial.println(gpsData);
   pCharacteristicGPS->setValue(gpsData.c_str());
   pCharacteristicGPS->notify();
  }
  else {
   Serial.println("GPS Location Data: Waiting for Signal");
   pCharacteristicGPS->setValue("Waiting for Signal");
   pCharacteristicGPS->notify();
  }
  if (gps.time.isValid()) {
   int Hour = gps.time.hour()+timeZoneOffset;
   int Minute = gps.time.minute();
   int Second = gps.time.second();
   String gpsTime = String(Hour) + ":" + String(Minute) + ":" + String(Second);
   Serial.println(gpsTime);
   pCharacteristicGPSTime->setValue(gpsTime.c_str());
   pCharacteristicGPSTime->notify();
  }
  else {
   Serial.println("GPS Time Data: Waiting for Signal");
   pCharacteristicGPSTime->setValue("Waiting for Signal");
   pCharacteristicGPSTime->notify();
  }
  for (;counter<=4;counter++){ 
   Serial.println("Switched to Transmitter");
   radio.openWritingPipe(pipe_address); 
   radio.stopListening();
   float Latitude = gps.location.lat();
   float Longitude = gps.location.lng();
   String Location = String(Latitude, 6) + " " + String(Longitude, 6);
  if (radio.write(Location.c_str(), Location.length() + 1)) { // +1 to include null terminator
   Serial.println(Location);
   Serial.println("Location TRANSMITTED SUCCESSFULLY");
  }
   int HOUR = gps.time.hour() + timeZoneOffset;
   int MINUTE = gps.time.minute();
   int SECOND = gps.time.second();
   String TIME = String(HOUR) + ":" + String(MINUTE) + ":" + String(SECOND);
  if (radio.write(TIME.c_str(), TIME.length() + 1)) { // +1 to include null terminator
   Serial.println(TIME);
   Serial.println("TIME TRANSMITTED SUCCESSFULLY");
  }
   Serial.print("counter:");
   Serial.println(counter);
 }
  for (;counter>=5 && counter<300;counter++) {
   //SOS Message is also received in this portion of my code we learned through testing
   Serial.println("Switched to Receiver");
   radio.startListening();
   radio.openReadingPipe(1, pipe_address); //receiving on address pipe = 0xF0F0F0F0E1LL
  while (radio.available()) {
   char receivedText_1[32]; //this received text will have the transmitter latitude,longitude 
   radio.read(&receivedText_1, sizeof(receivedText_1));
   String receivedData = String(receivedText_1);
   if(receivedData.startsWith("HELP")){
   pCharacteristicReceiveNotification->setValue(receivedData.c_str());
   pCharacteristicReceiveNotification->notify();
   Serial.print("Received Message ");
   Serial.println(receivedData);
   }
   else{
   pCharacteristicReceiveGPS->setValue(receivedData.c_str());
   pCharacteristicReceiveGPS->notify();
   Serial.print("Received Data ");
   Serial.println(receivedData);
   }
   char receivedText_2[32]; //this received text will have the transmitter time
   radio.read(&receivedText_2, sizeof(receivedText_2));
   String ReceivedData = String(receivedText_2);
   if(ReceivedData.startsWith("HELP")){
   pCharacteristicReceiveNotification->setValue(ReceivedData.c_str());
   pCharacteristicReceiveNotification->notify();
   Serial.print("Received Message ");
   Serial.println(ReceivedData);
   }
   else{
   pCharacteristicReceiveTime->setValue(ReceivedData.c_str());
   pCharacteristicReceiveTime->notify();
   Serial.print("Received Data ");
   Serial.println(ReceivedData);
   }
   char receivedMessage[32]; //this received message is the transmitted sos message
   radio.read(&receivedMessage, sizeof(receivedMessage));
   String ReceivedMessage = String(receivedMessage);
   if(ReceivedMessage.startsWith("HELP")){
   pCharacteristicReceiveNotification->setValue(ReceivedMessage.c_str());
   pCharacteristicReceiveNotification->notify();
   Serial.print("Received Message ");
   Serial.println(ReceivedMessage);
   }
  }
   Serial.print("counter:");
   Serial.println(counter);
 }
 counter=0; 
  }
 }
}

void sos_notification() {
  std::string sosMessage = pCharacteristicSOS->getValue(); // Encoded Msg Received
  if (!sosMessage.empty()) {
    // SOS button pressed in App so the App sent a notification over BLE to our device "I need Help My ID is 01"
    Serial.print("SOS message over BLE: ");
    Serial.println(sosMessage.c_str());
    String acknowledgmentMessage = "HELP is Coming!";
    pCharacteristicSOSAck->setValue(acknowledgmentMessage.c_str()); // Sending a response back to the app as acknowledgment
    pCharacteristicSOSAck->notify();
    Serial.println("Transmitting SOS Message"); // Transmit this msg over RF to all the other connected devices
    radio.openWritingPipe(pipe_address);
    radio.stopListening();
    if (radio.write(sosMessage.c_str(), sosMessage.length() + 1)) { // +1 to include null terminator
      Serial.println("SOS MESSAGE TRANSMITTED SUCCESSFULLY");
      sosMessageTransmitted = true; // Set flag to true since message is transmitted
      if (sosMessageTransmitted) {
        pCharacteristicSOS->setValue(""); // Clear the value
        Serial.println("Characteristic value cleared after message transmission");
      }
    } else {
      Serial.println("Failed to Transmit SOS message over RF");
    }
  } else {
    Serial.println("sosMessage is empty.");
  }
}

void weatherPrediction(float pressure_derivative, float temp, float pressure, float Altitude) {
 double po = pressure * pow((1 - (((0.0065 * Altitude) / (temp + 0.0065 * Altitude + 273.15)))), -5.257);
 Serial.println("Po=");
 Serial.println(po);
 Serial.println("Altitude=");
 Serial.println(Altitude);
 if (pressure_derivative > 0) {
   float Z1 = 160 - (0.16 * po);
   Serial.println("Z1=");
   Serial.println(Z1);
   if (Z1 >= 0 && Z1 <= 2) {
      prediction = "Fine Weather"; //Fine Weather
   } 
   else if (Z1 >= -2 && Z1 <= -0.1) {
      prediction = "Unsettled, Improving"; //Cloudy Weather
   }
   else if (Z1 >= -5 && Z1 <= -2) {
      prediction = "Stormy and Rain";
   }
 } 
 else if (pressure_derivative < 0) {
   float Z2 = 130 - (0.12 * po);
   Serial.println("Z2=");
   Serial.println(Z2);
   if (Z2 >= 10 && Z2 <= 12) {
      prediction = "Fine Weather"; //Fine Weather
   } 
   else if (Z2 > 8 && Z2 <= 10) {
      prediction = "Rain, worse later"; //Cloudy Weather
   }
   else if (Z2 > 5 && Z2 <= 8) {
      prediction = "Stormy and Rain";
   }
 }
 else if (pressure_derivative == 0) {
   float Z3 = 138 - (0.13 * po);
   Serial.println("Z3=");
   Serial.println(Z3);
   if (Z3 >= 8 && Z3 <= 10) {    
      prediction = "Fine Weather"; //Fine Weather
   }
   else if (Z3 > 6 && Z3 <= 8) { 
      prediction = "Changeable,Some Rain"; //Cloudy Weather
   }
   else if (Z3 > 3 && Z3 <= 6) {
      prediction = "Stormy and Rain";
   }
  }
  Serial.print("Weather Prediction: ");
  Serial.println(prediction);
  pCharacteristicPrediction->setValue(prediction.c_str());
  pCharacteristicPrediction->notify();
}

void loop() {
   if (pServer->getConnectedCount() > 0){
   env_gps_rf_transceiver();
   sos_notification();
  }
}
