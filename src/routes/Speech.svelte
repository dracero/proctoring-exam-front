<script>
    // @ts-nocheck
    import { onMount } from 'svelte';
    import { texto } from './stores.js';
    
  
    let recognition = null;
    let transcript = '';
    let textSpoken = '';
    let wordsSpoken = 0;
    let prevTimestamp = 0; // Store the previous timestamp
    let conversationTimeout = null;
    let conversation = ""; // Initialize conversation as an empty string

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
          
          // Calculate how much time has passed since the last word was spoken
          const currentTimestamp = Date.now();
          const timePassed = (currentTimestamp - prevTimestamp) / 1000; // Convert to seconds
          prevTimestamp = currentTimestamp; // Update the previous timestamp
          // Separate after dot
          transcript = transcript.replace(/\./g, ". "); 
          // Update words spoken        
          wordsSpoken = wordsSpoken+1;

          if (conversationTimeout !== null) {
            clearTimeout(conversationTimeout);
          }
          // Set up a timeout to check for conversation after a certain pause
          conversationTimeout = setTimeout(() => {
            if (wordsSpoken > 5) {
              const conversation = transcript.split(" ").slice(-(wordsSpoken+1)).join(" ");
              console.log("Conversation detected (timeout): " + conversation);
              sendToDB(conversation, transcript);
              wordsSpoken = 0;
            }  else {
              wordsSpoken = 0;
            }
          }, 10000); // 10 seconds pauseTime

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
 
  