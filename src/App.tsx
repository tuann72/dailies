import { useState } from "react";
import StartScreen from "./screens/StartScreen";
import GlobeGame from "./screens/GlobeGame";

function App() {
  const [screen, setScreen] = useState<"start" | "globe">("start");

  return (
    <div className="flex items-center justify-center min-h-screen">
      {screen === "start" ? (
        <StartScreen onStartGame={() => setScreen("globe")} />
      ) : (
        <GlobeGame onHome={() => setScreen("start")} />
      )}
    </div>
  );
}

export default App;
