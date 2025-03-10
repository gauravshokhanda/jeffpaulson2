import { View, TextInput, Text } from 'react-native';
import React from 'react';

const CustomTextInput = ({ placeholder, value, onChangeText, textLabel }) => {
    return (
        <View className="flex-row items-center border-b border-gray-300 my-5">
            <TextInput
                placeholder={placeholder}
                placeholderTextColor="gray"
                className="flex-1 text-lg text-gray-800 ml-5"
                value={value}
                onChangeText={onChangeText}
            />
            <Text className="text-gray-700">{textLabel}</Text>
        </View>
    );
};

export default CustomTextInput;
