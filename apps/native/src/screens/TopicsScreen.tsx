import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { useUser } from "@clerk/clerk-expo";
import { api } from "@packages/backend/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { ThemeContext } from "../theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

const TopicsScreen = ({ navigation }) => {
  const { isDark } = useContext(ThemeContext);
  const user = useUser();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");

  const topics = useQuery(api.topics.getTopics);
  const createTopic = useMutation(api.topics.createTopic);
  const deleteTopic = useMutation(api.topics.deleteTopic);

  const handleCreateTopic = async () => {
    if (!newTopicName.trim()) {
      Alert.alert("Error", "Please enter a topic name");
      return;
    }

    try {
      console.log("Creating topic:", newTopicName.trim());
      const topicId = await createTopic({ name: newTopicName.trim() });
      console.log("Topic created with ID:", topicId);
      setNewTopicName("");
      setShowAddModal(false);
    } catch (error) {
      console.error("Error creating topic:", error);
      Alert.alert("Error", "Failed to create topic: " + error.message);
    }
  };

  const handleDeleteTopic = (topicId) => {
    Alert.alert(
      "Delete Topic",
      "Are you sure you want to delete this topic and all its problems?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteTopic({ topicId }),
        },
      ]
    );
  };

  const renderTopic = ({ item }) => {
    const progress = item.totalProblems > 0 ? item.completedProblems / item.totalProblems : 0;
    
    return (
      <TouchableOpacity
        style={[styles.topicItem, { backgroundColor: isDark ? "#2A2A2A" : "#F9FAFB" }]}
        onPress={() => navigation.navigate("ProblemsScreen", { topic: item })}
      >
        <View style={styles.topicHeader}>
          <Text style={[styles.topicTitle, { color: isDark ? "#fff" : "#2D2D2D" }]}>
            {item.name}
          </Text>
          <TouchableOpacity
            onPress={() => handleDeleteTopic(item._id)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={20} color={isDark ? "#ff6b6b" : "#ff4757"} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: isDark ? "#444" : "#e0e0e0" }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress * 100}%`,
                  backgroundColor: progress === 1 ? "#4CAF50" : "#0D87E1",
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: isDark ? "#888" : "#666" }]}>
            {item.completedProblems}/{item.totalProblems} completed
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#181818" : "#F5F7FE" }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Coding Topics</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {!topics || topics.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateText, { color: isDark ? "#888" : "#666" }]}>
            No topics yet.{"\n"}Add your first coding topic to get started!
          </Text>
        </View>
      ) : (
        <FlatList
          data={topics}
          renderItem={renderTopic}
          keyExtractor={(item) => item._id}
          style={styles.topicsList}
          contentContainerStyle={styles.topicsListContent}
        />
      )}

      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? "#2A2A2A" : "#fff" }]}>
            <Text style={[styles.modalTitle, { color: isDark ? "#fff" : "#2D2D2D" }]}>
              Add New Topic
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? "#444" : "#f5f5f5",
                  color: isDark ? "#fff" : "#2D2D2D",
                  borderColor: isDark ? "#666" : "#ddd",
                },
              ]}
              placeholder="Enter topic name (e.g., Arrays, Dynamic Programming)"
              placeholderTextColor={isDark ? "#888" : "#999"}
              value={newTopicName}
              onChangeText={setNewTopicName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleCreateTopic}
              >
                <Text style={styles.addButtonText}>Add Topic</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: "#0D87E1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
  },
  headerTitle: {
    color: "#fff",
    fontSize: RFValue(18),
    fontWeight: "bold",
  },
  topicsList: {
    flex: 1,
  },
  topicsListContent: {
    padding: 16,
  },
  topicItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topicHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  topicTitle: {
    fontSize: RFValue(16),
    fontWeight: "600",
    flex: 1,
  },
  deleteButton: {
    padding: 4,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: RFValue(12),
    textAlign: "right",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: RFValue(16),
    textAlign: "center",
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    padding: 24,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: RFValue(18),
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: RFValue(16),
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
  },
  addButton: {
    backgroundColor: "#0D87E1",
  },
  cancelButtonText: {
    color: "#666",
    textAlign: "center",
    fontSize: RFValue(16),
    fontWeight: "600",
  },
  addButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: RFValue(16),
    fontWeight: "600",
  },
});

export default TopicsScreen; 