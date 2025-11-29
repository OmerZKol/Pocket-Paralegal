import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AppProvider } from "../contexts/AppContext";
import { ErrorBoundary } from "../components/ErrorBoundary";

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <StatusBar style="light" backgroundColor="#2c3e50" />
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </AppProvider>
    </ErrorBoundary>
  );
}
