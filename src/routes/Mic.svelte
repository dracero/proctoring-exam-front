<script>
//falta implementar no detecta bien el mic
let isMicOn = false;
async function checkMicStatus() {
 try {
       await navigator.mediaDevices.getUserMedia({ audio: true });
       isMicOn = true;
                
    }catch (error) {
        isMicOn = false;
    }
}


    checkMicStatus();


</script>
  
 {#if isMicOn}
    <p>The mic is on.</p>
  {:else}
    <p>The mic is off.</p>
  {/if}
  
  