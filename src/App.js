import { useState } from "react";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import "./styles/main.css";
import "./styles/chat.css";

const App = () => {
  const [page, setPage] = useState("login");

  if (page === "home") return <HomePage onLoginClick={() => setPage("login")} />;
  if (page === "signup") return (
    <SignupPage
      onGoLogin={() => setPage("login")}
      onViewHome={() => setPage("home")}
    />
  );
  return (
    <LoginPage
      onViewHome={() => setPage("home")}
      onGoSignup={() => setPage("signup")}
    />
  );
};

export default App;
