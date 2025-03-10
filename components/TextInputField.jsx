import { View, Text, TextInput } from 'react-native'
import React from 'react'

export default function TextInputField({ label, value, onChange }) {
    return (
        <View className="mb-4">
            <Text className="text-gray-700 mb-1">{label}</Text>
            <TextInput
                value={value}
                onChangeText={onChange}
                className="border border-gray-300 p-2 rounded-lg"
            />
        </View>
    )
}