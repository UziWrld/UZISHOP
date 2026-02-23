import React, { createContext, useContext, useState, useCallback } from 'react';

const LoadingContext = createContext(null);

/**
 * Proveedor de estado de carga global.
 * Rastrea múltiples tareas mediante un stack para saber si la app está "ocupada".
 */
export const LoadingProvider = ({ children }) => {
    const [tasks, setTasks] = useState([]);

    const startTask = useCallback((taskId) => {
        setTasks(prev => [...new Set([...prev, taskId])]);
    }, []);

    const endTask = useCallback((taskId) => {
        setTasks(prev => prev.filter(id => id !== taskId));
    }, []);

    const isLoading = tasks.length > 0;

    return (
        <LoadingContext.Provider value={{ isLoading, startTask, endTask, activeTasks: tasks }}>
            {children}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
};
