<script>
    let images = ["./img/instruccionesRegistro.png", "./img/instruccionesScreenshot.png", "./img/instruccionesAmenaza.png"];
    let currentImageIndex = 0;
  
    function nextImage() {
      if (currentImageIndex < images.length - 1) {
        currentImageIndex += 1;
      }
    }
  
    function prevImage() {
      if (currentImageIndex > 0) {
        currentImageIndex -= 1;
      }
    }
  
    let showOkButton = false;
  
    function showOk() {
      showOkButton = true;
    }
  </script>
  
  <div class="reel">
    {#if currentImageIndex === 0}
      <button disabled>←</button>
    {:else}
      <button on:click={prevImage}>←</button>
    {/if}
  
    <img src={images[currentImageIndex]} alt="Instruction" />
  
    {#if currentImageIndex === images.length - 1}
      {#if showOkButton}
        <button on:click={showOk}>Ok</button>
      {/if}
    {:else}
      <button on:click={nextImage}>→</button>
    {/if}
  </div>
  
  <style>
    .reel {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 1rem;
    }
  
    img {
      max-width: 100%;
      height: auto;
    }
  </style>
  