import { TextInput, useWindowDimensions } from "react-native";
import React from "react";

export default function AuthInput({
  placeholder,
  secureTextEntry,
  onChangeText,
  value,
}) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  return (
    <TextInput
      className="text-gray-700 rounded-lg mb-6 bg-slate-200"
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      onChangeText={onChangeText}
      value={value}
      style={{
        paddingHorizontal: screenWidth * 0.05,
        paddingVertical: screenHeight * 0.015,
        fontSize: screenWidth * 0.04,
        borderRadius: screenWidth * 0.03,
        marginVertical: screenHeight * 0.01,
        backgroundColor: "#e2e8f0",
      }}
      placeholderTextColor="#A0AEC0"
    />
  );
}
