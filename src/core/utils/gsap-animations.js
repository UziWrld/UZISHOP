import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const fadeIn = (element, delay = 0) => {
    gsap.fromTo(element,
        { opacity: 0 },
        { opacity: 1, duration: 1, delay, ease: 'power2.out' }
    );
};

export const slideUp = (element, delay = 0) => {
    gsap.fromTo(element,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, delay, ease: 'power3.out' }
    );
};

export const staggerReveal = (elements, delay = 0) => {
    gsap.fromTo(elements,
        { opacity: 0, y: 30 },
        {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            delay,
            ease: 'power2.out'
        }
    );
};

export const scrollReveal = (element, delay = 0) => {
    gsap.fromTo(element,
        { opacity: 0, y: 30 },
        {
            opacity: 1,
            y: 0,
            duration: 1,
            delay,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: element,
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        }
    );
};
