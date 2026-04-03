import React, { useState } from "react";
import { useRouter } from "next/router";
import EmotionComponent from "../emotion/emotion";

interface Tab {
  id: string;
  title: string;
  component: React.ReactNode;
}

const TabbedNavigation: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const router = useRouter();

  const addTab = (title: string, component: React.ReactNode) => {
    const tabId = title.toLowerCase().replace(/\s+/g, "-");
    if (!tabs.find((tab) => tab.id === tabId)) {
      const newTab = { id: tabId, title, component };
      setTabs((prevTabs) => [...prevTabs, newTab]);
      setActiveTab(tabId);
    } else {
      setActiveTab(tabId);
    }
  };

  const closeTab = (tabId: string) => {
    setTabs((prevTabs) => prevTabs.filter((tab) => tab.id !== tabId));
    if (activeTab === tabId && tabs.length > 1) {
      const index = tabs.findIndex((tab) => tab.id === tabId);
      setActiveTab(tabs[index - 1]?.id || tabs[index + 1]?.id);
    } else if (tabs.length === 1) {
      setActiveTab(null);
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      {/* Tab Headers */}
      <div className="flex space-x-4 border-b border-gray-300">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`flex items-center space-x-2 py-2 px-4 cursor-pointer ${activeTab === tab.id
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-700"
              }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.title}</span>
            <button
              className="text-red-500 hover:text-red-700"
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-grow bg-gray-100 p-4">
        {tabs.map(
          (tab) =>
            activeTab === tab.id && (
              <div key={tab.id} className="h-full">
                {tab.component}
              </div>
            )
        )}
      </div>

      {/* Links for Adding Tabs */}
      <div className="flex space-x-4 mt-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() =>
            addTab("Home", <div>Welcome to the Home Page!</div>)
          }
        >
          Add Home Tab
        </button>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={() =>
            addTab("Profile", <EmotionComponent />)
          }
        >
          Add Profile Tab
        </button>
        <button
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          onClick={() =>
            addTab("Settings", <EmotionComponent />)
          }
        >
          Add Settings Tab
        </button>
      </div>
    </div>
  );
};

export default TabbedNavigation;