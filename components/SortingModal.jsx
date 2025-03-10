import { Modal, TouchableOpacity, View, Text } from "react-native";

const SortingModal = ({ visible, onClose, onSelect, position }) => {
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity activeOpacity={1} onPress={onClose} className="flex-1">
        <View
          style={{
            position: "absolute",
            top: position.top,
            left: position.left,
            backgroundColor: "white",
            padding: 10,
            width: 100,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
            <View className="border-b">
                <Text className="font-bold">Sort by</Text>
            </View>
          <TouchableOpacity onPress={() => onSelect("asc")}>
            <Text className="py-2 text-center">A-Z</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onSelect("desc")}>
            <Text className="py-2 text-center">Z-A</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default SortingModal;
