<script>
import html2canvas from 'html2canvas';
import { page } from '$app/stores';

let screenshotUrl = ''

async function takeScreenshot() {
  const studentEmail = $page.data.session.user?.email;
  html2canvas(document.body, { useCORS: true }).then(async canvas => {
    screenshotUrl = canvas.toDataURL();    
    const response = await fetch('/api/inTestScreenshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: studentEmail,
        imageData: screenshotUrl })
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
<iframe src="https://docs.google.com/forms/d/e/1FAIpQLSdcVUjKVIfcsW1jC2LEKivhJR65bWGRTUkaLo1Nw1N26gWGXQ/viewform?embedded=true" width="100%" height="468" frameborder="0" marginheight="0" marginwidth="0" title="Google Form">Cargando…</iframe>
<button on:click={takeScreenshot}>Take Screenshot</button>
