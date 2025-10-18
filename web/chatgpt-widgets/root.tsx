import { Provider as GadgetProvider } from "@gadgetinc/react-chatgpt-apps";
import { api } from "../api";
// import our main app.css file so we inherit all styles that the main frontend is using
import "../app.css";

export const ChatGPTWidgetRoot = ({ children }: { children: React.ReactNode; }) => {
  // render within the GadgetProvider context so react hooks like `useFindMany` and `useFetch` work in ChatGPT widgets
  return <GadgetProvider api={api}>{children}</GadgetProvider>;
};

export default ChatGPTWidgetRoot;