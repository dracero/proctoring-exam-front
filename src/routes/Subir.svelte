<script>
  //@ts-nocheck
  import { page } from '$app/stores';
  
  $: isScreenshotUploaded = false;
  
  async function handleScreenshotUpload(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    const studentEmail = $page.data.session.user?.email;
    reader.readAsDataURL(file);
    reader.onloadend = async function() {
      const base64String = reader.result;
      console.log(base64String);
      const response = await fetch('/api/inScreenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: studentEmail,
          imageData: base64String })
      });
      if (response.ok) {
        console.log("Screenshot data inserted successfully");
        isScreenshotUploaded = true; // Update the state when screenshot is uploaded
      } else {
        console.error("Error inserting screenshot data:", response.statusText);
      }
    }
  }
  
  function redirectToExamPage() {
    window.location.href = 'https://campusgrado.fi.uba.ar/';
  }
</script>

<main>
  <div class="button-container">
    <input
      type="file"
      accept="image/png"
      on:change={handleScreenshotUpload}
      class="screenshot-input"
    />
    <button
      class="finalizar-button"
      on:click={redirectToExamPage}
      class:enabled={isScreenshotUploaded}
      class:disabled={!isScreenshotUploaded}
      disabled={!isScreenshotUploaded}
    >
      Finalizar
    </button>
  </div>
</main>

<style>
  .button-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .finalizar-button {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    color: white;
    cursor: pointer;
  }
  
  .finalizar-button.enabled {
    background-color: blue;
  }
  
  .finalizar-button.disabled {
    background-color: gray;
    cursor: not-allowed;
  }

</style>