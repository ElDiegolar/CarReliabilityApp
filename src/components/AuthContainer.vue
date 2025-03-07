<!-- src/components/AuthContainer.vue -->
<template>
    <div class="max-w-md mx-auto my-8 px-4">
        <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-blue-800">Vehicle Reliability AI</h1>
            <p class="text-gray-600 mt-2">Your trusted source for vehicle reliability insights</p>
        </div>

        <transition name="fade" mode="out-in">
            <LoginForm v-if="showLogin" @login-success="handleAuthSuccess" @switch-to-register="showLogin = false" />
            <RegisterForm v-else @register-success="handleAuthSuccess" @switch-to-login="showLogin = true" />
        </transition>
    </div>
</template>

<script>
import { ref } from 'vue';
import LoginForm from './LoginForm.vue';
import RegisterForm from './RegisterForm.vue';

export default {
    name: 'AuthContainer',
    components: {
        LoginForm,
        RegisterForm
    },
    emits: ['auth-success'],

    setup(props, { emit }) {
        const showLogin = ref(true);

        const handleAuthSuccess = (userData) => {
            emit('auth-success', userData);
        };

        return {
            showLogin,
            handleAuthSuccess
        };
    }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>