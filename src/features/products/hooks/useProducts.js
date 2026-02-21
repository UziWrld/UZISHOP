import { useState, useEffect } from 'react';
import { productService } from '@products/services/productService';
import { Product } from '@products/models/Product';

/**
 * useProducts Hook (Controller)
 * Manages fetching, filtering, and real-time synchronization of products.
 */
export const useProducts = (options = {}) => {
    const {
        gender = null,
        category = 'All',
        collectionId = null,
        size = null,
        color = null,
        sortBy = 'newest',
        autoSubscribe = true
    } = options;

    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initial Fetch/Subscription
    useEffect(() => {
        let unsubscribe = null;

        const processData = (data) => {
            const instances = Product.fromFirestore(data);
            setAllProducts(instances);
            setLoading(false);
        };

        if (autoSubscribe) {
            unsubscribe = productService.subscribeToProducts(processData);
        } else {
            productService.getAllProducts()
                .then(processData)
                .catch(err => {
                    console.error("Fetch error:", err);
                    setError(err);
                    setLoading(false);
                });
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [autoSubscribe]);

    // Filtering, Sorting, and Grouping Logic (The "Controller" part)
    useEffect(() => {
        if (allProducts.length === 0 && !loading) return;

        let result = [...allProducts].filter(p => p.status === 'active');

        // 1. Gender Filter
        if (gender) {
            const g = gender.toLowerCase().trim();
            result = result.filter(p => {
                const pGender = p.gender ? p.gender.toLowerCase().trim() : 'unisex';
                return pGender === g || pGender === 'unisex';
            });
        }

        // 2. Collection Filter
        if (collectionId && collectionId !== 'none') {
            result = result.filter(p => p.collectionId === collectionId || p.collection === collectionId);
        }

        // 3. Category Filter
        if (category !== 'All') {
            const catLower = category.toLowerCase().trim();
            result = result.filter(p => p.category && p.category.toLowerCase().trim() === catLower);
        }

        // 4. Size Filter
        if (size) {
            result = result.filter(p => p.variants && p.variants.some(v => v.size === size && v.stock > 0));
        }

        // 5. Color Filter
        if (color) {
            result = result.filter(p => p.color && p.color.toLowerCase() === color.toLowerCase());
        }

        // 6. Sorting
        if (sortBy === 'price-low') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-high') {
            result.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'newest') {
            result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else {
            result.reverse();
        }

        // 7. Grouping by Category for Shop Layout
        const categoriesList = ['Camisetas', 'Hoodies/Chaquetas', 'Pantalones', 'Accesorios', 'Sneakers'];
        const categoriesToDisplay = category === 'All' ? categoriesList : [category];

        const grouped = categoriesToDisplay.map(cat => {
            const catLower = cat.toLowerCase().trim();
            return {
                id: cat,
                label: cat === 'Camisetas' ? 'T-Shirts' :
                    cat === 'Pantalones' ? 'Pants' :
                        cat === 'Accesorios' ? 'Accessories' : cat,
                items: result.filter(p => p.category && p.category.toLowerCase().trim() === catLower)
            };
        }).filter(g => g.items.length > 0);

        setFilteredProducts(grouped);
    }, [allProducts, gender, category, collectionId, size, color, sortBy, loading]);

    // Extract available metadata for UI filters
    const availableSizes = [...new Set(allProducts.flatMap(p => p.variants ? p.variants.map(v => v.size) : []))].sort();
    const availableColors = [...new Set(allProducts.map(p => p.color).filter(c => c))].sort();

    return {
        products: filteredProducts,
        allProducts,
        availableSizes,
        availableColors,
        loading,
        error
    };
};
