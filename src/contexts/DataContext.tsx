// src/contexts/DataContext.tsx
// MoneyCheckアプリのデータ状態管理（React Context + localStorage）
// ユーザーデータは一切保存せず、セッション限定で管理
// 関連: types/moneycheck.ts, app/layout.tsx, app/input/page.tsx

"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserData } from '@/types/moneycheck';

const initialUserData: UserData = {
  mainIncome: 0,
  sideIncome: 0,
  investment: 0,
  consumption: 0,
  waste: 0,
  savings: 0,
  stockIncome: 0,
  creditPayment: 0,
  subscription: 0,
};

interface DataContextType {
  userData: UserData;
  setUserData: (data: UserData) => void;
  updateUserData: (field: keyof UserData, value: number) => void;
  clearUserData: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserDataState] = useState<UserData>(initialUserData);
  const [currentStep, setCurrentStep] = useState<number>(1);

  // セッション開始時にlocalStorageから復元（セッション限定）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('moneycheck-session');
      const savedStep = localStorage.getItem('moneycheck-step');

      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setUserDataState(parsedData);
        } catch (error) {
          console.error('Error parsing saved data:', error);
        }
      }

      if (savedStep) {
        setCurrentStep(parseInt(savedStep, 10));
      }
    }
  }, []);

  // データ変更時にlocalStorageに保存（セッション限定）
  const setUserData = (data: UserData) => {
    setUserDataState(data);
    if (typeof window !== 'undefined') {
      localStorage.setItem('moneycheck-session', JSON.stringify(data));
    }
  };

  const updateUserData = (field: keyof UserData, value: number) => {
    const newData = { ...userData, [field]: value };
    setUserData(newData);
  };

  const clearUserData = () => {
    setUserDataState(initialUserData);
    setCurrentStep(1);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('moneycheck-session');
      localStorage.removeItem('moneycheck-step');
    }
  };

  const setCurrentStepWithStorage = (step: number) => {
    setCurrentStep(step);
    if (typeof window !== 'undefined') {
      localStorage.setItem('moneycheck-step', step.toString());
    }
  };

  const value = {
    userData,
    setUserData,
    updateUserData,
    clearUserData,
    currentStep,
    setCurrentStep: setCurrentStepWithStorage,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}