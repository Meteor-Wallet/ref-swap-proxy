import { effect, signal } from '@preact/signals';

export const darkMode = signal(localStorage.getItem('darkMode') === 'dark');

effect(() => {
    if (darkMode.value) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.value ? 'dark' : 'light');
});
