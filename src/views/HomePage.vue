<!-- src/views/HomePage.vue -->
<template>
    <div class="home-page">
        <header class="hero">
            <div class="hero-content">
                <h1>Car Reliability App</h1>
                <p class="hero-subtitle">Find reliable vehicles and make informed decisions</p>
                <div class="cta-buttons" v-if="!isAuthenticated">
                    <router-link to="/auth/login" class="btn btn-primary">Login</router-link>
                    <router-link to="/auth/register" class="btn btn-outline">Register</router-link>
                </div>
            </div>
        </header>

        <section class="features">
            <div class="container">
                <h2 class="section-title">How It Works</h2>
                <div class="feature-grid">
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-search"></i>
                        </div>
                        <h3>Search Vehicles</h3>
                        <p>Browse our extensive database of cars and find the perfect match for your needs.</p>
                    </div>

                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-chart-bar"></i>
                        </div>
                        <h3>Compare Reliability</h3>
                        <p>See detailed reliability scores and compare different models side by side.</p>
                    </div>

                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-star"></i>
                        </div>
                        <h3>Read Reviews</h3>
                        <p>Access real user experiences and expert reviews to guide your decision.</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="popular-cars">
            <div class="container">
                <h2 class="section-title">Popular Reliable Cars</h2>
                <div class="car-grid">
                    <!-- Car cards would be dynamically generated here -->
                    <div class="car-card" v-for="car in popularCars" :key="car.id">
                        <div class="car-image">
                            <img :src="car.image" :alt="car.name">
                        </div>
                        <div class="car-info">
                            <h3>{{ car.make }} {{ car.model }}</h3>
                            <div class="reliability-score">
                                <span>Reliability Score:</span>
                                <div class="score-bar">
                                    <div class="score-fill" :style="{ width: car.reliabilityScore + '%' }"></div>
                                </div>
                                <span class="score-value">{{ car.reliabilityScore }}/100</span>
                            </div>
                            <router-link :to="'/cars/' + car.id" class="btn btn-sm">View Details</router-link>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="testimonials">
            <div class="container">
                <h2 class="section-title">What Our Users Say</h2>
                <div class="testimonial-slider">
                    <div class="testimonial" v-for="(testimonial, index) in testimonials" :key="index">
                        <div class="testimonial-content">
                            <p>"{{ testimonial.content }}"</p>
                        </div>
                        <div class="testimonial-author">
                            <span>{{ testimonial.author }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import authService from '@/services/authService';

export default {
    name: 'HomePage',
    data() {
        return {
            popularCars: [
                {
                    id: 1,
                    make: 'Toyota',
                    model: 'Camry',
                    image: '/img/cars/toyota-camry.jpg',
                    reliabilityScore: 92
                },
                {
                    id: 2,
                    make: 'Honda',
                    model: 'Accord',
                    image: '/img/cars/honda-accord.jpg',
                    reliabilityScore: 90
                },
                {
                    id: 3,
                    make: 'Lexus',
                    model: 'ES',
                    image: '/img/cars/lexus-es.jpg',
                    reliabilityScore: 95
                },
                {
                    id: 4,
                    make: 'Mazda',
                    model: 'CX-5',
                    image: '/img/cars/mazda-cx5.jpg',
                    reliabilityScore: 88
                }
            ],
            testimonials: [
                {
                    content: 'This app helped me find the most reliable car within my budget. Saved me from making a costly mistake!',
                    author: 'Michael S.'
                },
                {
                    content: 'The reliability data is so comprehensive. I feel much more confident in my car buying decisions now.',
                    author: 'Sarah J.'
                },
                {
                    content: 'As a first-time car buyer, this tool was invaluable in helping me understand what to look for.',
                    author: 'David L.'
                }
            ]
        };
    },
    computed: {
        isAuthenticated() {
            return authService.isAuthenticated();
        }
    }
};

</script>

<style scoped>
.home-page {

    font-family: 'Roboto', sans-serif;
}

.hero {
    background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7));
    background-size: cover;
    background-position: center;
    color: white;
    padding: 100px 20px;
    text-align: center;
}

.hero-content {
    max-width: 800px;
    margin: 0 auto;
}

.hero h1 {
    font-size: 3rem;
    margin-bottom: 20px;
}

.hero-subtitle {
    font-size: 1.5rem;
    margin-bottom: 40px;
    opacity: 0.9;
}

.cta-buttons {
    display: flex;
    justify-content: center;
    gap: 20px;
}

.btn {
    display: inline-block;
    padding: 12px 24px;
    border-radius: 4px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s ease;
}

.btn-sm {
    padding: 8px 16px;
    font-size: 0.9rem;
}

.btn-primary {
    background-color: #3498db;
    color: white;
}

.btn-primary:hover {
    background-color: #2980b9;
}

.btn-outline {
    border: 2px solid white;
    color: white;
}

.btn-outline:hover {
    background-color: white;
    color: #333;
}

.section-title {
    text-align: center;
    margin-bottom: 40px;
    font-size: 2rem;
    color: #333;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
}

.features,
.popular-cars,
.testimonials {
    padding: 60px 0;
}

.features {
    background-color: #f8f9fa;
}

.feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
}

.feature-card {
    background-color: white;
    border-radius: 8px;
    padding: 30px;
    text-align: center;
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
}

.feature-icon {
    font-size: 2.5rem;
    color: #3498db;
    margin-bottom: 20px;
}

.car-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 30px;
}

.car-card {
    background-color: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
}

.car-image img {
    width: 100%;
    height: 180px;
    object-fit: cover;
}

.car-info {
    padding: 20px;
}

.reliability-score {
    margin: 15px 0;
}

.score-bar {
    height: 10px;
    background-color: #eee;
    border-radius: 5px;
    margin: 8px 0;
    overflow: hidden;
}

.score-fill {
    height: 100%;
    background-color: #2ecc71;
}

.testimonials {
    background-color: #f8f9fa;
}

.testimonial-slider {
    display: flex;
    flex-wrap: wrap;
    gap: 30px;
    justify-content: center;
}

.testimonial {
    background-color: white;
    border-radius: 8px;
    padding: 30px;
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
    max-width: 350px;
}

.testimonial-content {
    font-style: italic;
    margin-bottom: 20px;
}

.testimonial-author {
    font-weight: 600;
    color: #666;
}

@media (max-width: 768px) {
    .hero h1 {
        font-size: 2.5rem;
    }

    .hero-subtitle {
        font-size: 1.2rem;
    }

    .cta-buttons {
        flex-direction: column;
        gap: 15px;
    }

    .section-title {
        font-size: 1.8rem;
    }
}
</style>