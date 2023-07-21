<script lang="ts">
	//import Cam from './Cam.svelte';
    import { page } from "$app/stores"
    import Detect from '../Detec.svelte';
    import Snap from '../Snap.svelte';
    import Screen from '../Screen.svelte';
    import Speech from '../Speech.svelte';
    import Detectab from '../Detect.svelte';
    import Mic from '../Mic.svelte';
    import Subir from "../Subir.svelte";
</script>
{#if $page.data.session}
<h1>Protected page</h1>
<p>
  This is a protected content. You can access this content because you are
  signed in.
</p>
<Detect />
<Snap />
<Screen />
<Speech />
<Detectab />
<Subir />
<Mic />
<!--<embed src="http://chimuelo.fi.uba.ar/login/index.php" style="position:left; width: 1280px; height: 500px; overflow:hidden; z-index:999999;"/>-->
<iframe src="https://docs.google.com/forms/d/e/1FAIpQLSdcVUjKVIfcsW1jC2LEKivhJR65bWGRTUkaLo1Nw1N26gWGXQ/viewform?embedded=true" width="100%" height="468" frameborder="0" marginheight="0" marginwidth="0" title="Google Form">Cargando…</iframe>
{:else}
<h1>Access Denied</h1>
<p>
  <a href="/auth/signin">
    You must be signed in to view this page
  </a>
</p>
{/if}

