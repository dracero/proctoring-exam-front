<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

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
      const studentEmail = $page.data.session.user?.email;
      // Send the data to the server
      const response = await fetch('/api/inBlur', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: studentEmail,
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
  
  async function handleAltTabPress(event) {
    if (event.altKey) {
        // The Alt+Tab key combination was pressed
        console.log("Alt+Tab pressed!");
        // You can add any additional logic here
    }
  }
  onMount(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('keydown', handleAltTabPress);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('keydown', handleAltTabPress);
    };
  });
</script>
<!--¿Modifico Esto?-->
{#if isLeavingPage}
  <p>Are you sure you want to leave this page?</p>
{/if}
