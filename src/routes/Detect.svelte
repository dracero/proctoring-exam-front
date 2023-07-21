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

  function handleBlur() {
    console.log('blur');
    // Perform any necessary actions when the user switches to another program
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

{#if isLeavingPage}
  <p>Are you sure you want to leave this page?</p>
{/if}
