import { useState, useEffect } from 'react';
import { collectionService } from '../services/collectionService';
import { Collection } from '../models/Collection';

/**
 * useCollections Hook (Controller)
 * Manages the state and business logic for collections.
 */
export const useCollections = () => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                setLoading(true);
                const rawData = await collectionService.getAllCollections();

                // Transform raw data into Collection model instances
                const modelInstances = Collection.fromFirestore(rawData);

                // Filter active and valid collections
                const activeCollections = modelInstances.filter(c => c.isValid());

                setCollections(activeCollections);
            } catch (err) {
                console.error("Error in useCollections hook:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCollections();
    }, []);

    return {
        collections,
        loading,
        error
    };
};
