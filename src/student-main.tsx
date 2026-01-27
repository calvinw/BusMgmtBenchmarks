import { createRoot } from "react-dom/client";
import StudentApp from "./StudentApp.tsx";
import "./app.css";

createRoot(document.getElementById("root")!).render(<StudentApp />);
