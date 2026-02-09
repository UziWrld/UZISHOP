import React, { useEffect } from 'react';
import HeroVideo from '../components/HeroVideo';
import Marquee from '../components/home/Marquee';
import FeaturedCollections from '../components/home/FeaturedCollections';
import NewArrivals from '../components/home/NewArrivals';
import BrandStory from '../components/home/BrandStory';

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
