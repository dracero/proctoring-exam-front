<script lang=ts>

    export let state;
    export let continueToRegistration: () => void; // Specify the function type

    import {scale, fly, fade} from 'svelte/transition';
    
    $: images = ["/images/instruccionesRegistro.png", "/images/instruccionesScreenshot.png", "/images/instruccionesAmenaza.png"];
    $: currentImageIndex = 0;
  
    function nextImage() {
        currentImageIndex += 1;
    }
  
    function prevImage() {
        currentImageIndex -= 1;
    }
  
  </script>

    {#if currentImageIndex === 0}
        <div class="arrow-container left-arrow">
            <button class="arrow-button-disabled" disabled></button>
        </div>
        <div class="image-container"> 
            <img in:fade={{delay:200}} src={"/images/instruccionesRegistro.png"} alt="Instruction" />
        </div>
        <div class="arrow-container right-arrow">
            <button class="arrow-button" on:click={nextImage}></button>
        </div>
    {/if}
    {#if currentImageIndex === 1}
        <div class="arrow-container left-arrow">
          <button class="arrow-button" on:click={prevImage}></button>  
        </div>
      <div class="image-container"> 
          <img in:fade={{delay:200}} src={"/images/instruccionesScreenshot.png"} alt="Instruction" />
      </div>
      <div class="arrow-container right-arrow">
          <button class="arrow-button" on:click={nextImage}></button>
      </div>
    {/if}
    {#if currentImageIndex === 2}
        <div class="arrow-container left-arrow">
          <button class="arrow-button left-arrow" on:click={prevImage}></button> 
        </div>    
      <div class="image-container">
        <img in:fade={{delay:200}} src={"/images/instruccionesAmenaza.png"} alt="Instruction" />
      </div>
      <div class="arrow-container right-arrow">
        <button class="arrow-button-disabled" disabled></button>
      </div>  
      <button in:fade={{delay:1000}} class="continue-button" on:click={continueToRegistration}>Continuar</button>
    {/if}
  
  <style>

    .image-container {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 1rem;
    }
  
    img {
        width: 720px; /* Set the width for the resized images */
        height: 600px; /* Set the height for the resized images */
        max-width: 100%; /* Ensure images don't exceed their container */
        height: auto;
    }

    .continue-button {
      position: fixed;
      bottom: 5%; /* Adjust this value to control the distance from the bottom */
      left: 50%;
      transform: translateX(-50%);
      padding: 15px 30px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 5px;
      font-weight: bold;
      font-family: Helvetica;
      font-size: 16px;
      cursor: pointer;
    }

    .continue-button:active {
        background-color: rgb(0, 144, 253);
     }
    .arrow-container {
        position: fixed;
        top: 50%;
        transform: translateY(-50%);
    }

    .arrow-container.left-arrow {
        left: 10%;
    }

    .arrow-container.right-arrow {
        right: 10%;
    }

    .arrow-button {
        width: 60px;
        height: 60px;
        background-color: #3498db;
        border: none;
        border-radius: 50%;
        color: white;
        font-size: 20px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    .arrow-button-disabled {
        width: 60px;
        height: 60px;
        background-color: #c7c7c7;
        border: none;
        border-radius: 50%;
        color: white;
        font-size: 20px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    .arrow-button::before {
        content: "";
        display: inline-block;
        width: 10px;
        height: 10px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(-45deg);
    }

    .arrow-button-disabled::before {
        content: "";
        display: inline-block;
        width: 10px;
        height: 10px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(-45deg);
    }

    .arrow-container.left-arrow .arrow-button::before {
        margin-right: 5px;
        transform: rotate(135deg);
    }

    .arrow-container.right-arrow .arrow-button::before {
        margin-left: 5px;
        transform: rotate(-45deg);
    }

    .arrow-container.left-arrow .arrow-button-disabled::before {
        margin-right: 5px;
        transform: rotate(135deg);
    }

    .arrow-container.right-arrow .arrow-button-disabled::before {
        margin-left: 5px;
        transform: rotate(-45deg);
    }

    .arrow-button:hover {
        background-color: #2980b9;
    }

</style>
  