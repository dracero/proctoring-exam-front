<script>
  import { onMount } from 'svelte';

  let isLeavingPage = false;

  function handleBeforeUnload() {
    isLeavingPage = true;
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      alert('You are leaving the page');
      // Perform any necessary actions when the user switches away from the page
    } else {
      alert('You are back to the page')
      // Perform any necessary actions when the user switches back to the page
    }
  }

  async function handleBlur() {
    try {
      // Get the current date and time
      const currentDate = new Date();
      const dateTime = currentDate.toLocaleString();

      // Create the notification message
      const notification = "User has left the page.";

      // Send the data to the server
      const response = await fetch('/api/inBlur', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notification: notification,
          dateTime: dateTime
        })
      });

      if (response.ok) {
        console.log("On Blur: Data inserted successfully");
      } else {
        console.error("On Blur: Error inserting data:", response.statusText);
      }
    } catch (error) {
      console.error("On Blur: An error occurred:", error);
    }
  }
  
  onMount(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  });
</script>
<!--¿Modifico Esto?-->
{#if isLeavingPage}
  <p>Are you sure you want to leave this page?</p>
{/if}
