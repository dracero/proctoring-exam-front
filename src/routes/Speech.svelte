<script>
    // @ts-nocheck
    import { onMount } from 'svelte';
    import { texto } from './stores.js';
    
  
    let recognition = null;
    let transcript = '';
    let textSpoken = '';

    texto.subscribe(value => { 
      textSpoken = value;
      console.log(textSpoken);
    });
    
    onMount(() => {
      window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new window.SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
  
      recognition.onresult = event => {
        transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
          //store to use in another component
          texto.set(transcript);
    }

    //I need to find out the length of the transcript
     recognition.start();
       // Reset the timer on each new result
       recognition.onend = () => {
        recognition.start();
      };
    });

  
  </script>
  
  <p>{transcript}</p>
 
  