<script>
import html2canvas from 'html2canvas';
let screenshotUrl = '';

function takeScreenshot() {
  html2canvas(document.body, { useCORS: true }).then(async canvas => {
    screenshotUrl = canvas.toDataURL();    
    // Here, you can send the screenshot to the database
    const response = await fetch('/api/inScreenshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageData: screenshotUrl })
    });
    
    if (response.ok) {
      console.log("Data inserted successfully");
    } else {
      console.error("Error inserting data:", response.statusText);
    }
  });
}

</script>

<!--En un futuro esto hay que hacerlo por tiempo en función de la duración del examen-->
<button on:click={takeScreenshot}>Take Screenshot</button>