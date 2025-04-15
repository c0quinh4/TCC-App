/**
 * @format
 */

import { AppRegistry, LogBox } from 'react-native';
import App from './App';
import appConfig from '../../app.json';
LogBox.ignoreLogs(['new NativeEventEmitter']);

const appName = appConfig.expo.name; 
AppRegistry.registerComponent(appName, () => App);

import React from 'react';
import { View, Text } from 'react-native';

export default function TabsIndexScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>This is the Index for (tabs)</Text>
    </View>
  );
}