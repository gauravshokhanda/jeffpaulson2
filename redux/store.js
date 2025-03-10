import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';

// Import reducers
import authReducer from './slice/authSlice';
import contractorReducer from './slice/contractorsSlice';
import polygonReducer from './slice/polygonSlice';
import breakdownCostReducer from './slice/breakdownCostSlice';
import realStatePropertyReducer from './slice/realStatePropertySlice';

// Persist Configuration
const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    whitelist: ['auth','realStateProperty'], // Persist only auth, preventing unnecessary state persistence
};

// Root Reducer
const rootReducer = combineReducers({
    auth: authReducer,
    contractorsList: contractorReducer,
    polygon: polygonReducer,
    breakdownCost: breakdownCostReducer,
    realStateProperty:realStatePropertyReducer,
});

// Persisted Reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Store Configuration
const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

// Persistor
const persistor = persistStore(store);

export { store, persistor };
