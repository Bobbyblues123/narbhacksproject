import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Linking,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { api } from "@packages/backend/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { ThemeContext } from "../theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

const ProblemsScreen = ({ navigation, route }) => {
  const { topic } = route.params;
  const { isDark } = useContext(ThemeContext);

  const problems = useQuery(api.problems.getProblemsByTopic, { topicId: topic._id });
  const markProblemCompleted = useMutation(api.problems.markProblemCompleted);

  console.log("ProblemsScreen - Topic:", topic);
  console.log("ProblemsScreen - Problems:", problems);

  const handleToggleCompletion = async (problemId, isCompleted) => {
    try {
      await markProblemCompleted({ problemId, isCompleted: !isCompleted });
    } catch (error) {
      console.error("Error toggling completion:", error);
    }
  };

  const handleOpenLeetCode = (url) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "#4CAF50";
      case "Medium":
        return "#FF9800";
      case "Hard":
        return "#F44336";
      default:
        return "#666";
    }
  };

  const renderProblem = ({ item }) => {
    return (
      <View style={[styles.problemItem, { backgroundColor: isDark ? "#2A2A2A" : "#F9FAFB" }]}>
        <View style={styles.problemHeader}>
          <View style={styles.problemTitleContainer}>
            <Text style={[styles.problemTitle, { color: isDark ? "#fff" : "#2D2D2D" }]}>
              {item.title}
            </Text>
            <View
              style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor(item.difficulty) },
              ]}
            >
              <Text style={styles.difficultyText}>{item.difficulty}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => handleToggleCompletion(item._id, item.isCompleted)}
            style={[
              styles.checkbox,
              {
                backgroundColor: item.isCompleted ? "#4CAF50" : "transparent",
                borderColor: item.isCompleted ? "#4CAF50" : isDark ? "#666" : "#ccc",
              },
            ]}
          >
            {item.isCompleted && (
              <Ionicons name="checkmark" size={16} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.problemDescription, { color: isDark ? "#ccc" : "#666" }]}>
          {item.description}
        </Text>
        
        {item.leetcodeUrl && (
          <TouchableOpacity
            style={styles.leetcodeButton}
            onPress={() => handleOpenLeetCode(item.leetcodeUrl)}
          >
            <Ionicons name="open-outline" size={16} color="#0D87E1" />
            <Text style={styles.leetcodeButtonText}>Open on LeetCode</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#181818" : "#F5F7FE" }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{topic.name}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${(topic.completedProblems / Math.max(topic.totalProblems, 1)) * 100}%`,
                backgroundColor: topic.completedProblems === topic.totalProblems ? "#4CAF50" : "#0D87E1",
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: isDark ? "#888" : "#666" }]}>
          {topic.completedProblems}/{topic.totalProblems} completed
        </Text>
      </View>

      {!problems || problems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateText, { color: isDark ? "#888" : "#666" }]}>
            No problems yet.{"\n"}Problems will be generated automatically!
          </Text>
        </View>
      ) : (
        <FlatList
          data={problems}
          renderItem={renderProblem}
          keyExtractor={(item) => item._id}
          style={styles.problemsList}
          contentContainerStyle={styles.problemsListContent}
        />
      )}
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
    flex: 1,
    textAlign: "center",
  },
  progressContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: RFValue(14),
    textAlign: "center",
    fontWeight: "500",
  },
  problemsList: {
    flex: 1,
  },
  problemsListContent: {
    padding: 16,
  },
  problemItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  problemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  problemTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  problemTitle: {
    fontSize: RFValue(16),
    fontWeight: "600",
    marginBottom: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  difficultyText: {
    color: "#fff",
    fontSize: RFValue(12),
    fontWeight: "600",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  problemDescription: {
    fontSize: RFValue(14),
    lineHeight: 20,
    marginBottom: 12,
  },
  leetcodeButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#f0f8ff",
  },
  leetcodeButtonText: {
    color: "#0D87E1",
    fontSize: RFValue(14),
    fontWeight: "500",
    marginLeft: 4,
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
});

export default ProblemsScreen; 