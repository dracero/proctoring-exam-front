import { writable } from 'svelte/store';

export const count = writable(0);
//I need to export a base64 type variable
export const image = writable("");

export const texto = writable("");