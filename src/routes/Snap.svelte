<script>
// @ts-nocheck
import { count, image } from './stores.js';
let countValue;
let imageValue;
//Acá pongo en cero el contador
count.subscribe(async value => {
	 countValue = value;
     if (countValue == 101){
            count.set(0);
    }
});    
//Acá tengo la imagen
image.subscribe(async value => {
    imageValue = value;
});
console.log(imageValue);
</script>

