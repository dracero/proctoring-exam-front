<script>
    // @ts-nocheck
    import { onMount } from "svelte";
    let stream;
    let videoRef;
    /**
	 * @type {HTMLCanvasElement}
	 */
    let canvasRef;

    async function getStream() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });
            videoRef.srcObject = stream;
        } catch (err) {
            console.error(err);
        }
        console.log(stream.getTracks()[0])
    }

    async function takePhoto() {
        // @ts-ignore
        canvasRef.getContext('2d').drawImage(videoRef, 0, 0, canvasRef.width, canvasRef.height);
        const dataUrl = canvasRef.toDataURL('image/png');
    }

    onMount(() => {
        getStream();
    });

</script>

<section class="container mx-auto px-4">
    <h1 class="text-4xl text-blue-500 my-4">Webcam Stream Mastery</h1>
    <button class="rounded-sm bg-blue-600 text-white px-4 py-2" on:click|preventDefault={takePhoto}>Take Photo</button>
    <!-- svelte-ignore a11y-media-has-caption -->
    <video class="mt-4 rounded-sm " width="640" height="480" autoplay={true} bind:this={videoRef} />
    <canvas class="mt-4 rounded-sm" width="640" height="480" bind:this={canvasRef}></canvas>
</section>
