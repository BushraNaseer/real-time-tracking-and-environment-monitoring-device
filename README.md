# Real-Time Tracking and Environment Monitoring Device for Outdoor Activities

## Overview

This repository contains the implementation of our Final Year Project (FYP), **Real-Time Tracking and Environment Monitoring Device for Outdoor Activities**, developed as part of the B.S. Electrical Engineering program at the **Institute of Space Technology (IST), Islamabad**.

The project provides a reliable communication and monitoring solution for outdoor environments where **cellular networks are unavailable or unreliable**. A network of portable devices shares real-time GPS locations with one another through RF communication while simultaneously monitoring environmental conditions for local storm prediction. An Android application displays the received location and weather information using Bluetooth Low Energy (BLE).

---

## Problem Statement

Outdoor activities such as hiking, trekking, rescue missions, and military operations often take place in remote regions with little or no cellular coverage. Under these conditions, team members require a reliable method to:

* Share their locations with each other
* Monitor changing weather conditions
* Receive emergency alerts
* Operate independently of cellular infrastructure

This project addresses these challenges by creating a self-contained wireless network of tracking devices.

---

## Key Features

* 📍 Real-time GPS location sharing between multiple devices
* 📡 RF communication without cellular or Wi-Fi networks
* 🌦 Local weather prediction using the Zambretti Forecast Algorithm
* 🌡 Environmental monitoring using temperature and atmospheric pressure
* 📱 Android application for visualization
* 🔵 Bluetooth Low Energy (BLE) communication with the mobile application
* 🆘 SOS emergency alert system
* 🔋 Low-power embedded system design
* 👥 Supports approximately **60–70 devices** in the network

---

## System Architecture

The system consists of multiple portable embedded nodes.

Each node:

* Acquires GPS coordinates.
* Measures environmental parameters.
* Predicts local weather conditions.
* Shares its location with other nodes using RF communication.
* Sends processed information to the Android application through BLE for visualization.

The communication network operates independently of cellular infrastructure, making it suitable for remote environments.

---

## Hardware Components

* ESP32 Development Board
* NEO-6M GPS Module
* BMP280 Temperature & Pressure Sensor
* NRF24L01+PA+LNA RF Transceiver Module
* Bluetooth Low Energy (BLE)

---

## Software Stack

* Arduino IDE
* C/C++
* React Native
* Google Maps API
* BLE Communication
* SPI
* UART
* I²C

---

## Communication Technologies

| Technology                 | Purpose                                                |
| -------------------------- | ------------------------------------------------------ |
| NRF24L01+PA+LNA            | Node-to-node wireless communication                    |
| Bluetooth Low Energy (BLE) | Communication between hardware and Android application |
| GPS                        | Real-time positioning                                  |
| I²C                        | BMP280 sensor interface                                |
| UART                       | GPS communication                                      |
| SPI                        | RF module interface                                    |

---

## Android Application

The Android application (**Hikecast**) provides:

* Live GPS location visualization
* Weather prediction display
* Environmental monitoring
* SOS emergency notifications

---

## Project Workflow

1. GPS acquires the user's location.
2. BMP280 measures temperature and atmospheric pressure.
3. ESP32 processes sensor data.
4. The Zambretti Forecast Algorithm predicts local weather conditions.
5. Nodes exchange location data using the NRF24L01 RF network.
6. Processed information is transmitted to the Android application using BLE.
7. Users can trigger an SOS alert that is broadcast throughout the network.

---

## Applications

* Hiking and Trekking
* Mountaineering
* Search and Rescue Operations
* Military Operations
* Disaster Response
* Outdoor Expeditions
* Remote Area Monitoring

---

## Results

The developed system successfully achieved:

* Two-way RF communication with an approximate range of **1 km**
* Support for **60–70 interconnected devices**
* **94% weather prediction accuracy**
* Real-time location visualization without relying on cellular networks
* Emergency SOS broadcasting across the network

---

## Future Improvements

* LoRa integration for extended communication range
* Mesh networking for larger deployments
* Cloud synchronization when internet becomes available
* AI-based weather prediction
* Lower power optimization
* Cross-platform mobile application support

---

## 🚀 Download & Installation

To test the mobile application without setting up the entire development environment, you can download the ready-to-install app binary.

### 📱 Android App (APK)
* **Latest Stable Version:** (https://github.com/BushraNaseer/real-time-tracking-and-environment-monitoring-device/releases/tag/v1.0.0)
* **Direct Download:** 📥 

### 🛠️ Quick Installation Steps
1. Download the **APK file** using your Android smartphone.
2. Open the downloaded file. If prompted, enable **"Install from Unknown Sources"** in your phone settings.
3. Follow the on-screen prompts to complete the installation.
4. Ensure your phone is connected to the internet/hardware local network before launching the app.

---
## Authors

**Bushra Naseer**

B.S. Electrical Engineering

Institute of Space Technology (IST), Islamabad

---

## License

This repository is intended for educational and research purposes.
Please provide appropriate attribution if you use any part of this work.
