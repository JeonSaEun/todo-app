import { StatusBar } from "expo-status-bar";
import { Fontisto, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	TouchableHighlight,
	TouchableWithoutFeedback,
	Pressable,
	TextInput,
	ScrollView,
	Alert,
	Platform,
} from "react-native";
import { theme } from "./colors";

const STORAGE_KEY_TODOS = "@toDos";
const STORAGE_KEY_WORK = "@headerMenu";

export default function App() {
	const [working, setWorking] = useState(true);
	const [text, setText] = useState("");
	const [toDos, setToDos] = useState({});

	useEffect(() => {
		loadToDos();
	}, []);

	const loadToDos = async () => {
		const str = await AsyncStorage.getItem(STORAGE_KEY_TODOS);
		const work = await AsyncStorage.getItem(STORAGE_KEY_WORK);
		if (str && work) {
			setToDos(JSON.parse(str));
			setWorking(JSON.parse(work));
		}
	};
	const travel = async () => {
		setWorking(false);
		await AsyncStorage.setItem(STORAGE_KEY_WORK, false.toString());
	};
	const work = async () => {
		setWorking(true);
		await AsyncStorage.setItem(STORAGE_KEY_WORK, true.toString());
	};
	const onChangeText = (payload) => setText(payload);
	const addToDo = async () => {
		const newToDos = {
			...toDos,
			[Date.now()]: { text, working, check: "passive" },
		};
		if (!text) {
			return;
		}
		setToDos(newToDos);
		await saveToDos(newToDos);
		setText("");
	};
	const saveToDos = async (toSave) => {
		await AsyncStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(toSave));
	};
	const editToDo = async (key) => {
		Alert.prompt(
			"Edit To Do",
			null,
			[
				{ text: "Cancel" },
				{
					text: "OK",
					onPress: async (newTxt) => {
						const newToDos = { ...toDos };
						newToDos[key].text = newTxt;
						setToDos(newToDos);
						await saveToDos(newToDos);
					},
				},
			],
			"plain-text",
			toDos[key].text
		);
	};
	const deleteToDo = async (key) => {
		if (Platform.OS === "web") {
			const ok = confirm("Do you want to delete this To Do?");
			if (ok) {
				const newToDos = { ...toDos };
				delete newToDos[key];
				setToDos(newToDos);
				await saveToDos(newToDos);
				setText("");
			}
		} else {
			Alert.alert("Delete To Do?", "Are you sure?", [
				{ text: "Cancel" },
				{
					text: "I'm sure",
					style: "destructive",
					onPress: async () => {
						const newToDos = { ...toDos };
						delete newToDos[key];
						setToDos(newToDos);
						await saveToDos(newToDos);
						setText("");
					},
				},
			]);
		}
	};

	const toggleCheck = async (key) => {
		const newToDos = { ...toDos };

		if (newToDos[key].check == "active") {
			newToDos[key].check = "passive";
		} else {
			newToDos[key].check = "active";
		}

		setToDos(newToDos);
		await saveToDos(newToDos);
	};

	return (
		<View style={styles.container}>
			<StatusBar style="light" />
			<View style={styles.header}>
				<TouchableOpacity onPress={work}>
					<Text
						style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
					>
						Work
					</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={travel}>
					<Text
						style={{
							...styles.btnText,
							color: !working ? "white" : theme.grey,
						}}
					>
						Travel
					</Text>
				</TouchableOpacity>
			</View>
			<TextInput
				style={styles.input}
				placeholder={working ? "Add a To Do" : "Where do you want to go?"}
				returnKeyType="done"
				onChangeText={onChangeText}
				value={text}
				onSubmitEditing={addToDo}
			/>
			<ScrollView style={{ flex: 1 }}>
				{Object.keys(toDos).map((i) =>
					toDos[i].working === working ? (
						<View style={styles.toDo} key={i}>
							<TouchableHighlight onPress={() => toggleCheck(i)}>
								<Fontisto
									name={`checkbox-${toDos[i].check}`}
									size={24}
									color="white"
								/>
							</TouchableHighlight>
							<Text
								style={
									toDos[i].check == "passive"
										? styles.toDoText
										: styles.toDoActive
								}
							>
								{toDos[i].text}
							</Text>
							<View style={styles.buttonView}>
								<TouchableHighlight
									onPress={() => editToDo(i)}
									style={styles.mr10}
								>
									<MaterialIcons name="edit" size={24} color={theme.grey} />
								</TouchableHighlight>
								<TouchableOpacity onPress={() => deleteToDo(i)}>
									<Fontisto name="trash" size={20} color={theme.grey} />
								</TouchableOpacity>
							</View>
						</View>
					) : null
				)}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.bg,
		paddingHorizontal: 20,
	},
	header: {
		flexDirection: "row",
		marginTop: 100,
		justifyContent: "space-between",
	},
	btnText: {
		fontSize: 44,
		fontWeight: "600",
	},
	input: {
		backgroundColor: "white",
		paddingVertical: 15,
		paddingHorizontal: 20,
		borderRadius: 30,
		marginVertical: 20,
		fontSize: 18,
	},
	toDo: {
		backgroundColor: theme.bg,
		marginBottom: 10,
		paddingVertical: 20,
		paddingHorizontal: 20,
		borderRadius: 15,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	toDoText: {
		color: "white",
		fontSize: 16,
		fontWeight: 500,
	},
	toDoActive: {
		color: theme.grey,
		fontSize: 16,
		fontWeight: 500,
		textDecorationLine: "line-through",
	},
	buttonView: {
		flexDirection: "row",
	},
	mr10: {
		marginRight: 10,
	},
});
