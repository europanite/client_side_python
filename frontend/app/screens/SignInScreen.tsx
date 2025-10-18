import React, { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { useAuth } from "../context/Auth";
import { useNavigation } from "@react-navigation/native";

const FORM_MAX_W = 480; // keep consistent with SignUp

export default function SignInScreen() {
  const { signIn } = useAuth();
  const nav = useNavigation<any>();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setErr(null); setLoading(true);
    try {
      await signIn(email.trim(), pw);
      nav.navigate("Home");
    } catch (e: any) {
      setErr(String(e.message || e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, paddingVertical: 24, paddingHorizontal: 16 }}>
      {/* Center column with max width */}
      <View style={{ flex: 1, alignItems: "center" }}>
        <View style={{ width: "100%", maxWidth: FORM_MAX_W, gap: 12 }}>
          <Text style={{ fontSize: 22, fontWeight: "700" }}>Sign In</Text>
          {err && <Text style={{ color: "crimson" }}>{err}</Text>}

          <View style={{ gap: 8, borderWidth: 1, borderRadius: 8, padding: 12 }}>
            <View>
              <Text>Email</Text>
              <TextInput
                testID="email"
                style={{ borderWidth: 1, borderRadius: 6, padding: 8, width: "100%" }}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            <View>
              <Text>Password</Text>
              <TextInput
                testID="password"
                style={{ borderWidth: 1, borderRadius: 6, padding: 8, width: "100%" }}
                value={pw}
                onChangeText={setPw}
                secureTextEntry
              />
            </View>
          </View>

          <Button testID="submit" title={loading ? "Signing in..." : "Sign In"} onPress={onSubmit} />
        </View>
      </View>
    </View>
  );
}
