import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

const CustomDatePicker = ({ label, value, onChangeDate }) => {
    const [show, setShow] = useState(false);

    const onChange = (event, selectedDate) => {
        setShow(Platform.OS === 'ios'); 
        if (selectedDate) {
            onChangeDate(selectedDate); 
        }
    };

    return (
        <View className="my-5">
            <Text className="text-lg font-medium mb-2">{label}</Text>
            <TouchableOpacity 
                className="flex-row items-center border-b border-gray-300 py-3"
                onPress={() => setShow(true)}
            >
                <Text className="flex-1 text-lg text-gray-800 ml-2">
                    {value ? value.toDateString() : "Select Date"}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="gray" />
            </TouchableOpacity>

            {show && (
                <DateTimePicker
                    value={value || new Date()}
                    mode="date"
                    display="default"
                    onChange={onChange}
                />
            )}
        </View>
    );
};

export default CustomDatePicker;
