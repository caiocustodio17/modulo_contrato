import { Tab, Tabs } from "@mui/material";
import { ReactNode, useState, useEffect } from "react";

export interface TabsCustomProps {
  label: string;
  content: ReactNode;
}

interface TabsContainerProps {
  tabs: TabsCustomProps[];
  defaultTabIndex?: number;
}

export function TabPanelComponent({ tabs, defaultTabIndex = 0 }: TabsContainerProps) {
  const [value, setValue] = useState(defaultTabIndex);

  useEffect(() => {
    setValue(defaultTabIndex);
  }, [defaultTabIndex]);

  const handleChange = (
    _evt: React.SyntheticEvent<Element, Event>,
    newValue: number
  ) => setValue(newValue);

  return (
    <div>
      <Tabs value={value} onChange={handleChange}>
        {tabs.map((tab, index: number) => (
          <Tab key={`tab-${index}`} label={tab.label} />
        ))}
      </Tabs>
      {tabs[value].content}
    </div>
  );
}
