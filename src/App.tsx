import { useEffect, useState } from "react";

import liff from "@line/liff";
import { Loader2 } from "lucide-react";
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
  ContextMenu: null,
  Toolbar: () => (
    <Toolbar
      onSend={async (blobUrl: string) => {
        // upload to imgur
        const blob = await fetch(blobUrl).then((res) => res.blob());
        const file = new File([blob], "image.png");
        const formData = new FormData();
        formData.append("image", file);
        const res = await fetch("https://api.imgur.com/3/image", {
          method: "POST",
          headers: {
            Authorization: `Client-ID ${import.meta.env.VITE_IMGUR_CLIENT_ID}`,
          },
          body: formData,
        });

        const { data } = await res.json();
        const url = data.link as string;

        try {
          await liff.sendMessages([
            {
              type: "image",
              originalContentUrl: url,
              previewImageUrl: url,
            },
          ]);

          liff.closeWindow();
        } catch {
          alert("無法傳送訊息，請確認此頁面是否為直接在 LINE 中開啟");
        }
      }}
    />
  ),
};

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  useEffect(() => {
    liff.init(
      {
        liffId: import.meta.env.VITE_LIFF_ID as string,
        withLoginOnExternalBrowser: true,
      },
      () => setIsInitialized(true),
      () => setIsInitialized(false),
    );
  }, []);

  if (!isInitialized)
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        </div>
      </div>
    );

  return (
    <div className="fixed inset-0">
      <Tldraw components={components} forceMobile={true}></Tldraw>
    </div>
  );
}

export default App;
