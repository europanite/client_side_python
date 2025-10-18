import React from "react";
import { View, Text, TouchableOpacity, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../context/Auth";
import { useNavigation } from "@react-navigation/native";

const BAR_BG = "#000000ff";
const CONTENT_MAX_W = 480; // ← same as forms

export default function SettingsBar() {
  const { user, signOut } = useAuth();
  const nav = useNavigation<any>();
  const { width } = useWindowDimensions();
  const isNarrow = width < 420; // stack buttons below on very small widths
  const NOT_SIGNED_COLOR = BAR_BG; 

  const Btn = ({ title, onPress }: { title: string; onPress: () => void }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: "#fff",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        borderWidth: 1,
      }}
    >
      <Text style={{ fontWeight: "600" }}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={["top"]} style={{ backgroundColor: BAR_BG }}>
      <StatusBar style="dark" backgroundColor={BAR_BG} />
      <View style={{ backgroundColor: BAR_BG, paddingHorizontal: 12, paddingVertical: 10 }}>
        <View style={{ alignItems: "center" }}>
          <View style={{ width: "100%", maxWidth: CONTENT_MAX_W, gap: 8 }}>
            <View
              style={{
                flexDirection: isNarrow ? "column" : "row",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
