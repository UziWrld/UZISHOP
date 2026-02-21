import { useState, useEffect } from 'react';
import { collectionService } from '@products/services/collectionService';

/**
 * useCollectionData Hook
 * Fetches specific metadata for a collection by ID.
 */
export const useCollectionData = (collectionId) => {
    const [collectionData, setCollectionData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!collectionId || collectionId === 'none') {
            setCollectionData(null);
            return;
        }

        const fetchColData = async () => {
            try {
                setLoading(true);
                const allCols = await collectionService.getAllCollections();
                const col = allCols.find(c => c.id === collectionId);
                setCollectionData(col);
            } catch (error) {
                console.error("Error fetching collection data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchColData();
    }, [collectionId]);

    return { collectionData, loading };
};
