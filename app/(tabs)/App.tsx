import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';

// Importa o DeviceModal e o hook useBLE conforme sua estrutura
import DeviceModal from '../DeviceConnectionModal';
import useBLE from '../useBLE';

const App = () => {
  // useBLE retorna métodos e estados usados para gerenciar a conexão BLE
  const {
    requestPermissions,
    scanForPeripherals,
    allDevices,
    connectToDevice,
    connectedDevice,
    sensorValue,       // valor recebido do acelerômetro via BLE
    disconnectFromDevice,
  } = useBLE();

  // Controle do modal que exibe os dispositivos disponíveis
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  // Estado para registrar as leituras (estilo chat)
  const [log, setLog] = useState<string[]>([]);
  // Referência para o ScrollView, permitindo rolagem automática
  const scrollViewRef = useRef<ScrollView>(null);

  // Toda vez que o sensorValue mudar, adiciona uma linha no log
  useEffect(() => {
    if (sensorValue !== undefined && sensorValue !== null) {
      setLog(prev => [...prev, `Leitura: ${sensorValue}`]);
    }
  }, [sensorValue]);

  // Sempre que o log for atualizado, o ScrollView rola para o final
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [log]);

  // Função que solicita permissões e inicia a varredura por dispositivos BLE
  const scanForDevices = () => {
    requestPermissions(isGranted => {
      if (isGranted) {
        scanForPeripherals();
      }
    });
  };

  // Abre o modal e inicia o scan
  const openModal = async () => {
    scanForDevices();
    setIsModalVisible(true);
  };

  // Fecha o modal
  const hideModal = () => {
    setIsModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Exibição do valor atual do sensor */}
      <View style={styles.sensorDisplay}>
        {connectedDevice ? (
          <>
            <Text style={styles.sensorTitleText}>Leitura do sensor:</Text>
            <Text style={styles.sensorValueText}>{sensorValue}</Text>
          </>
        ) : (
          <Text style={styles.sensorTitleText}>
            Conecte a um sensor
          </Text>
        )}
      </View>

      {/* Botão de Connect/Disconnect */}
      <TouchableOpacity
        onPress={connectedDevice ? disconnectFromDevice : openModal}
        style={styles.ctaButton}
      >
        <Text style={styles.ctaButtonText}>
          {connectedDevice ? 'Desconectar' : 'Conectar'}
        </Text>
      </TouchableOpacity>

      {/* Área de log estilo chat (ScrollView com altura limitada) */}
      <View style={styles.logContainer}>
        <ScrollView
          ref={scrollViewRef}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {log.map((entry, index) => (
            <Text key={index} style={styles.logLine}>
              {entry}
            </Text>
          ))}
        </ScrollView>
      </View>

      {/* Modal que lista os dispositivos BLE disponíveis para conexão */}
      <DeviceModal
        visible={isModalVisible}
        closeModal={hideModal}
        connectToPeripheral={connectToDevice}
        devices={allDevices}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  sensorDisplay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sensorTitleText: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 20,
    color: 'black',
  },
  sensorValueText: {
    fontSize: 25,
    marginTop: 15,
  },
  ctaButton: {
    backgroundColor: 'purple',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    marginHorizontal: 20,
    marginBottom: 5,
    borderRadius: 8,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  logContainer: {
    marginTop: 10,
    height: '40%', // você pode ajustar para a altura desejada ou usar maxHeight
    backgroundColor: '#f0f0f0',
    padding: 10,
  },
  logLine: {
    fontSize: 12,
    marginBottom: 4,
  },
});

export default App;
