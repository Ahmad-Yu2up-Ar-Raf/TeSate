// components/provider/LastReadProvider.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'LAST_READ';

type LastRead = {
  surahNomor: number;
  surahName?: string;
  ayat?: number | null; // null means start of surah, undefined means unknown/unspecified
};

type ContextType = {
  lastRead: LastRead | null;
  setLastRead: (value: LastRead) => Promise<void>;
};

const LastReadContext = createContext<ContextType | null>(null);

export function LastReadProvider({ children }: { children: React.ReactNode }) {
  const [lastRead, setLastReadState] = useState<LastRead | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await AsyncStorage.getItem(KEY);
      if (data) setLastReadState(JSON.parse(data));
    };
    load();
  }, []);

  const setLastRead = async (value: LastRead) => {
    setLastReadState(value); // update memory first (instant UI update)
    await AsyncStorage.setItem(KEY, JSON.stringify(value));
  };

  return (
    <LastReadContext.Provider value={{ lastRead, setLastRead }}>
      {children}
    </LastReadContext.Provider>
  );
}

export function useLastRead() {
  const ctx = useContext(LastReadContext);
  if (!ctx) throw new Error('useLastRead must be used inside provider');
  return ctx;
}