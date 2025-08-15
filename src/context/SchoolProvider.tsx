
'use client';

import React, { createContext, useContext, ReactNode } from 'react';

type SchoolContextType = {
  schoolId: string | null;
};

const SchoolContext = createContext<SchoolContextType>({ schoolId: null });

export function SchoolProvider({ children, schoolId }: { children: ReactNode, schoolId: string }) {
  return (
    <SchoolContext.Provider value={{ schoolId }}>
      {children}
    </SchoolContext.Provider>
  );
}

export function useSchool() {
  const context = useContext(SchoolContext);
  if (context === undefined) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
}
