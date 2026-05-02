import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme/theme';

export const CustomAlert = () => {
  const { alert, hideAlert } = useAppStore();
  const [inputValue, setInputValue] = useState('');

  if (!alert) return null;

  const handleButtonPress = (onPress?: (val?: string) => void) => {
    if (onPress) onPress(alert.showPrompt ? inputValue : undefined);
    setInputValue('');
    hideAlert();
  };

  return (
    <Modal transparent visible={!!alert} animationType="fade">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.overlay}
      >
        <View style={styles.content}>
          <Text style={styles.title}>{alert.title}</Text>
          <Text style={styles.message}>{alert.message}</Text>
          
          {alert.showPrompt && (
            <TextInput
              style={styles.input}
              value={inputValue}
              onChangeText={setInputValue}
              placeholder={alert.defaultValue}
              placeholderTextColor={theme.colors.textSecondary}
              autoFocus
            />
          )}

          <View style={styles.buttonContainer}>
            {alert.buttons && alert.buttons.length > 0 ? (
              alert.buttons.map((btn, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[
                    styles.button, 
                    index > 0 && styles.buttonBorder,
                    btn.style === 'destructive' && styles.destructiveButton
                  ]} 
                  onPress={() => handleButtonPress(btn.onPress)}
                >
                  <Text style={[
                    styles.buttonText, 
                    btn.style === 'destructive' && { color: '#FFF' },
                    btn.style === 'cancel' && { color: theme.colors.textSecondary }
                  ]}>
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <TouchableOpacity style={styles.button} onPress={() => hideAlert()}>
                <Text style={styles.buttonText}>OK</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  content: {
    width: '100%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  message: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.typography.body,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    width: '100%',
    padding: theme.spacing.md,
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
  },
  buttonBorder: {
    marginTop: theme.spacing.xs,
  },
  destructiveButton: {
    backgroundColor: theme.colors.danger,
  },
  buttonText: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
});
