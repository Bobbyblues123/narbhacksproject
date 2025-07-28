import { useUser } from "@clerk/clerk-expo";
import { AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import { api } from "@packages/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { useState, useContext } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { ThemeContext } from "../theme/ThemeContext";

const NotesDashboardScreen = ({ navigation }) => {
  const user = useUser();
  const imageUrl = user?.user?.imageUrl;
  const firstName = user?.user?.firstName;
  const { isDark } = useContext(ThemeContext);

  const allNotes = useQuery(api.notes.getNotes);
  const [search, setSearch] = useState("");

  const finalNotes = search
    ? allNotes?.filter(
        (note) =>
          note.title.toLowerCase().includes(search.toLowerCase()) ||
          note.content.toLowerCase().includes(search.toLowerCase())
      )
    : allNotes;

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("InsideNoteScreen", {
          item: item,
        })
      }
      activeOpacity={0.5}
      style={[styles.noteItem, { backgroundColor: isDark ? "#2A2A2A" : "#F9FAFB" }]}
    >
      <Text style={[styles.noteText, { color: isDark ? "#fff" : "#2D2D2D" }]}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#181818" : "white" }]}>
      <View style={styles.header}>
        <Image
          source={require("../assets/icons/logo2small.png")}
          style={styles.logo}
        />
        <TouchableOpacity
          style={{ position: 'absolute', right: 16, top: 16 }}
          onPress={() => navigation.navigate('SettingsScreen')}
        >
          <Ionicons name="settings-sharp" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.yourNotesContainer}>
        <Image style={styles.avatarSmall} />
        <Text style={[styles.title, { color: isDark ? "#fff" : "#2D2D2D" }]}>Your Notes</Text>
        {imageUrl ? (
          <Image style={styles.avatarSmall} source={{ uri: imageUrl }} />
        ) : (
          <Text style={{ color: isDark ? "#fff" : "#2D2D2D" }}>{firstName ? firstName : ""}</Text>
        )}
      </View>
      <View style={[styles.searchContainer, { 
        borderColor: isDark ? "#444" : "grey",
        backgroundColor: isDark ? "#2A2A2A" : "white"
      }]}>
        <Feather
          name="search"
          size={20}
          color={isDark ? "#888" : "grey"}
          style={styles.searchIcon}
        />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search"
          placeholderTextColor={isDark ? "#888" : "#999"}
          style={[styles.searchInput, { color: isDark ? "#fff" : "#2D2D2D" }]}
        />
      </View>
      {!finalNotes || finalNotes.length === 0 ? (
        <View style={[styles.emptyState, { 
          backgroundColor: isDark ? "#2A2A2A" : "#F9FAFB",
          borderColor: isDark ? "#444" : "rgba(0, 0, 0, 0.59)"
        }]}>
          <Text style={[styles.emptyStateText, { color: isDark ? "#888" : "grey" }]}>
            Create your first note to{"\n"}get started
          </Text>
        </View>
      ) : (
        <FlatList
          data={finalNotes}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          style={styles.notesList}
          contentContainerStyle={{
            marginTop: 19,
            borderTopWidth: 0.5,
            borderTopColor: isDark ? "#444" : "rgba(0, 0, 0, 0.59)",
          }}
        />
      )}

      <TouchableOpacity
        onPress={() => navigation.navigate("CreateNoteScreen")}
        style={styles.newNoteButton}
      >
        <AntDesign name="pluscircle" size={20} color="#fff" />
        <Text style={styles.newNoteButtonText}>Create a New Note</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={() => navigation.navigate("TopicsScreen")}
        style={[styles.newNoteButton, styles.codingButton]}
      >
        <Ionicons name="code-slash" size={20} color="#fff" />
        <Text style={styles.newNoteButtonText}>Coding Problems</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: "#0D87E1",
    height: 67,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 46,
    height: 46,
    borderRadius: 20,
    resizeMode: "contain",
  },
  title: {
    fontSize: RFValue(17.5),
    fontFamily: "MMedium",
    alignSelf: "center",
  },
  yourNotesContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 13,
    marginTop: 19,
  },
  avatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 15,
    marginTop: 30,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: RFValue(15),
    fontFamily: "MRegular",
  },
  notesList: {
    flex: 1,
  },
  noteItem: {
    padding: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0, 0, 0, 0.59)",
  },
  noteText: {
    fontSize: 16,
    fontFamily: "MLight",
  },
  newNoteButton: {
    flexDirection: "row",
    backgroundColor: "#0D87E1",
    borderRadius: 7,
    width: Dimensions.get("window").width / 1.6,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    position: "absolute",
    bottom: 35,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  codingButton: {
    bottom: 95,
    backgroundColor: "#FF6B35",
  },
  newNoteButtonText: {
    color: "white",
    fontSize: RFValue(15),
    fontFamily: "MMedium",
    marginLeft: 10,
  },
  emptyStateText: {
    textAlign: "center",
    alignSelf: "center",
    fontSize: RFValue(15),
    fontFamily: "MLight",
  },
  emptyState: {
    width: "100%",
    height: "35%",
    marginTop: 19,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
  },
});

export default NotesDashboardScreen;
