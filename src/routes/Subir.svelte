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
    <label class="label">
      <input
        type="file"
        accept="image/png"
        on:change={handleScreenshotUpload}
        class="screenshot-input"
      />
      <span>Tomar Screenshot</span>
    </label>
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
    justify-content: center;
    align-items: center;
  }

  .finalizar-button,
  .label {
    width: 200px; /* Set a fixed width for both buttons */
    padding: 20px 0;
    border: none;
    border-radius: 5px;
    margin: 5px;
    color: white;
    cursor: pointer;
    font-weight: bold;
    font-family: Helvetica;
    font-size: 16px;
    text-align: center;
    transition: background-color 0.3s;
  }

  .finalizar-button.enabled {
    background-color: #0055ff;
  }

  .finalizar-button.disabled {
    background-color: gray;
    cursor: not-allowed;
  }

  label.label input[type="file"] {
    position: absolute;
    top: -1000px;
  }

  .label {
    cursor: pointer;
    background: #0055ff;
    color: white;
    font-weight: bold;
    display: inline-block;
  }

  .label:active {
    background: rgb(0, 144, 253);
  }
</style>