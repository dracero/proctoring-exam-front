<script>
  import { afterUpdate, onMount } from 'svelte';
  import { page } from '$app/stores';
  import Subir from './Subir.svelte';

  // Add a boolean flag to track if the animation has been triggered
  let animationTriggered = true;
  
  // Function to trigger the CSS animation
  function triggerAnimation() {
    animationTriggered = true;
  }

  // Function to take a screenshot initially and then every minute
  async function takeScreenshotEveryMinute() {
    // Your existing code for taking screenshots goes here...
  }

  // Call the function to start taking screenshots every minute when the component is mounted
  $: takeScreenshotEveryMinute();

  // Call the function to trigger the animation after the component is updated/rendered
  afterUpdate(() => {
    if (animationTriggered) {
      triggerAnimation();
      // After the animation duration (3 seconds), render the iframe
      setTimeout(() => {
        animationTriggered = false; // Reset the animation trigger flag
      }, 3000);
    }
  });

  onMount(async () => {
    let studentEmail = $page.data.session.user?.email;

    const response = await fetch('/api/inTest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: studentEmail}) // Send the required data as JSON
    });

    if (!response.ok) {
      console.error('On Test: Failed to send the required data');
    } else {
      console.log('On Test: Successfully sent the required data')
    }
  });

</script>

<style>
  /* Style for the tick element container */
  .tick-container {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100px;
    height: 100px;
    opacity: 1;
    animation: tickAnimation 3s forwards;
  }

  /* Style for the circle */
  .circle {
    fill: green;
    cx: 32;
    cy: 32;
    r: 30;
  }

  /* Style for the tick SVG path */
  .tick-path {
    fill: none;
    stroke: white;
    stroke-width: 6;
    stroke-linecap: round;
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: drawTick 1s linear forwards;
  }

  /* Define the CSS animation for the tick */
  @keyframes tickAnimation {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  /* Define the CSS animation for drawing the tick */
  
  @keyframes drawTick {
    to {
      stroke-dashoffset: 0;
    }
  }

  .fade-in {
    animation: fadeInAnimation 1s;
  }

  /* Define the fade-in animation */
  @keyframes fadeInAnimation {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }

</style>


<!-- Conditionally render the animation before the iframe -->
<!--  -->
<!-- https://docs.google.com/forms/d/e/1FAIpQLSf-b1Ayz1opy_IiQGDQMKi0gDzBBFUK6SHxQAI5_OJ0q8b2KQ/viewform?embedded=true -->
{#if animationTriggered}
  <div class="tick-container">
    <svg width="100%" height="100%" viewBox="0 0 64 64">
      <circle class="circle" />
      <path
        class="tick-path"
        d="M20 32l8 8 16-16"
      />
    </svg>
  </div>
{:else}
  <div class="fade-in">
    <iframe src="http://localhost/course/management.php" width="640" height="2013" frameborder="0" marginheight="0" marginwidth="0" title="Embedded Google Form">Cargando…</iframe>
  </div> 
  <Subir /> 
{/if}

