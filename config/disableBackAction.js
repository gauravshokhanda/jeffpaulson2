import { useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native';

const disableBackAction = () => {
    useFocusEffect(() => {
        const onBackPress = () => {
            return true;
        };

        BackHandler.addEventListener('hardwareBackPress', onBackPress);

        return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    });
};
