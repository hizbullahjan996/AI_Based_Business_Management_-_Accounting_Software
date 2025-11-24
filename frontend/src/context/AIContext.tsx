import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { DemandPrediction, PaymentRecommendation, BusinessInsight } from '../types/ai';

interface AIState {
  demandPredictions: DemandPrediction[];
  paymentRecommendations: PaymentRecommendation[];
  businessInsights: BusinessInsight[];
  loading: {
    demand: boolean;
    payments: boolean;
    insights: boolean;
  };
  error: string | null;
}

type AIAction =
  | { type: 'SET_DEMAND_PREDICTIONS'; payload: DemandPrediction[] }
  | { type: 'SET_PAYMENT_RECOMMENDATIONS'; payload: PaymentRecommendation[] }
  | { type: 'SET_BUSINESS_INSIGHTS'; payload: BusinessInsight[] }
  | { type: 'SET_LOADING'; payload: { key: keyof AIState['loading']; value: boolean } }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_DATA' };

const initialState: AIState = {
  demandPredictions: [],
  paymentRecommendations: [],
  businessInsights: [],
  loading: {
    demand: false,
    payments: false,
    insights: false,
  },
  error: null,
};

function aiReducer(state: AIState, action: AIAction): AIState {
  switch (action.type) {
    case 'SET_DEMAND_PREDICTIONS':
      return {
        ...state,
        demandPredictions: action.payload,
      };
    case 'SET_PAYMENT_RECOMMENDATIONS':
      return {
        ...state,
        paymentRecommendations: action.payload,
      };
    case 'SET_BUSINESS_INSIGHTS':
      return {
        ...state,
        businessInsights: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value,
        },
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'CLEAR_DATA':
      return {
        ...state,
        demandPredictions: [],
        paymentRecommendations: [],
        businessInsights: [],
        error: null,
      };
    default:
      return state;
  }
}

interface AIContextType {
  state: AIState;
  dispatch: React.Dispatch<AIAction>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

interface AIProviderProps {
  children: ReactNode;
}

export const AIProvider: React.FC<AIProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(aiReducer, initialState);

  return (
    <AIContext.Provider value={{ state, dispatch }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAIContext = (): AIContextType => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAIContext must be used within an AIProvider');
  }
  return context;
};