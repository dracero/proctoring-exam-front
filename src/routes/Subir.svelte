<script>
    //@ts-nocheck
    let base64String;
  
    function handleFileInput(event) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async function() {
        base64String = reader.result;
        console.log(base64String);
        const response = await fetch('/api/inScreenshot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageData: base64String })
        }); 
       if (response.ok) {
                          console.log("Data inserted successfully");
        } else {
                console.error("Error inserting data:", response.statusText);
               }
      }
    }
</script>
  
  <main>
    <input type="file" accept="image/png" on:change={handleFileInput}>
  </main>