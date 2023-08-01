<script>
    // @ts-nocheck
    import { onMount } from 'svelte';
    import { texto } from './stores.js';
    
  
    let recognition = null;
    let transcript = '';
    let textSpoken = '';
    let wordsSpoken = 0;
    let prevTimestamp = 0; // Store the previous timestamp


    async function sendToDB(conversation, transcript){
      const response = await fetch('/api/inConversation', {
          method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              conversation: conversation, // Add the email here
              context: transcript
            })
         });
         if (response.ok) {
            console.log("Data inserted successfully");
         } else {
            console.error("Error inserting data:", response.statusText); 
      }
    }


    texto.subscribe(value => { 
      textSpoken = value;
    });
    
    // Load Speech Recognition API to "recognition" variable
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
          
          // Calculate how much time has passed since the last event was triggered
          const currentTimestamp = Date.now();
          const timePassed = (currentTimestamp - prevTimestamp) / 1000; // Convert to seconds
          prevTimestamp = currentTimestamp; // Update the previous timestamp

          transcript = transcript.replace(/\./g, ". "); // Establezco la separación en puntos
          wordsSpoken = wordsSpoken+1;

          console.log(wordsSpoken);

          if (timePassed > 3){
            if (wordsSpoken > 5) {
                const conversation = transcript.split(" ").slice(-(wordsSpoken+1),-1).join(" ")
                console.log("Conversation detected: " + conversation)
                sendToDB(conversation,transcript);
                wordsSpoken = 0;
            } else {
              wordsSpoken = 0;
            }
          }

          // Set up a timer to reset wordsSpoken and startTime after 5 seconds
          //setTimeout(() => {
          //  wordsSpoken = 0;
          //}, 10000);
          //store to use in another component
          
          texto.set(transcript);
      }

      //I need to find out the length of the transcript
      recognition.start();
      // Reset the timer on each new result
      recognition.onend = () => {
          recognition.start();
        };
      }
    );

  </script>
  
  <p>{transcript}</p>
 
  