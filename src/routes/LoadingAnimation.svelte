<script>
    import {scale } from 'svelte/transition';
</script>
  
<div class="animation-container">
    <div class="ring" in:scale={{delay:500}}></div>
</div>

<style>

.animation-container {
    position: fixed;
    top: calc(87%); /* Adjust the top position as needed */
    left: calc(48%); /* Adjust the left position as needed */
}  

.loading-button {
    display: inline-block;
    width: 40vw;
    height: 10vh;
    transform: scale(0.8);
    font-size: 20px;
    font-weight: bold;
    text-align: center;
    line-height: 50px;
    background-color: rgb(0, 150, 255);
    border: none;
    border-radius: 8px;
    cursor: default;
}

.ring {
    color:rgb(110, 110, 110);
    width: 30px;
    height: 30px;
    border: 4px solid; /* Update color to white */
    border-radius: 50%;
    border-top-color: transparent; /* Change color as needed */
    animation: rotate 1s linear infinite;
    margin: auto;
}

@keyframes rotate {
    0% {
    transform: rotate(0deg);
    }
    100% {
    transform: rotate(360deg);
    }
}
</style>