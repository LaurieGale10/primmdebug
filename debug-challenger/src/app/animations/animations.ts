import {animation, style, animate, trigger, transition, useAnimation, keyframes} from '@angular/animations';

export const expandBorderAnimation = animation([
    animate('1.5s 500ms ease-in-out',
        keyframes([
          style({border: '#f2f3f4 solid 5px'}),
          style({border: 'black 5px solid'}),
          style({border: '#f2f3f4 solid 5px'})
        ])
      )
]);