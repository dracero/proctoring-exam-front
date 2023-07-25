<script lang="ts">
    import { fly } from 'svelte/transition';
    import { fade } from 'svelte/transition';
    export let msg: string;
  </script>
  
  <div class="message-container">
      <p class="message-text" in:fly={{ y: -100, duration: 1000 , delay:200 }} style="font-family: Helvetica">{msg}</p>
  </div>
  
  <style>
    .message-container {
      position: fixed;
      width:40vw;
      height:10vh;
      border-radius:20px 20px 0px 0px;
      top: 22%;
      left: 50%;
      transform: translateX(-50%);
      background-color:rgb(122, 122, 122);
      z-index: 100;
    }
  
    .message-text {
      position: relative;
      width:30vw;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 16px;
      font-weight: bold;
      text-align:center;
      color: #ffffff;
      margin: 0;
    }
  </style>