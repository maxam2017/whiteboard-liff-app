import { TLComponents, Tldraw } from "tldraw";
import "tldraw/tldraw.css";

import { Toolbar } from "./components/toolbar";

const components: TLComponents = {
  MainMenu: null,
  PageMenu: null,
  ActionsMenu: null,
  HelpMenu: null,
  DebugPanel: null,
  NavigationPanel: null,
  QuickActions: null,
  StylePanel: null,
  Toolbar: () => <Toolbar />,
};

function App() {
  return (
    <div className="fixed inset-0">
      <Tldraw components={components} forceMobile={true}></Tldraw>
    </div>
  );
}

export default App;
