import React, { useEffect } from 'react';
import HeroVideo from '@core/components/HeroVideo';
import Marquee from '@products/components/home/Marquee';
import FeaturedCollections from '@products/components/home/FeaturedCollections';
import NewArrivals from '@products/components/home/NewArrivals';
import BrandStory from '@products/components/home/BrandStory';

const HomePage = () => {
    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="homepage-premium">
            <HeroVideo />
            <NewArrivals />
            <FeaturedCollections />
        </div>
    );
};

export default HomePage;
