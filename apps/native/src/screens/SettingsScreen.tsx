import React, { useContext } from "react";
import { View, Text, Switch, StyleSheet, TouchableOpacity, Image } from "react-native";
import { ThemeContext } from "../theme/ThemeContext";

const SettingsScreen = ({ navigation }) => {
  const { isDark, toggleTheme } = useContext(ThemeContext);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#181818" : "#F5F7FE" }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            style={styles.arrowBack}
            source={require("../assets/icons/arrow-back.png")}
          />
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDark ? "#fff" : "#222" }]}>Settings</Text>
        <View style={{ width: 20 }} />
      </View>
      <View style={styles.row}>
        <Text style={{ color: isDark ? "#fff" : "#222", fontSize: 16 }}>Dark Mode</Text>
        <Switch value={isDark} onValueChange={toggleTheme} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#D9D9D9",
  },
  arrowBack: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 16,
    paddingHorizontal: 24,
  },
});

export default SettingsScreen; 