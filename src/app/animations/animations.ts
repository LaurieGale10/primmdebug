import {animation, style, animate, trigger, transition, useAnimation, keyframes, sequence} from '@angular/animations';

export const expandBorderAnimation = animation([
  //No ability to integrate the animation-iteration-count with Angular animations so has to be hard-coded unless I want to change the trigger (which is necessarily based on the debugging stage)
  //Doesn't seem to call the last animation in the sequence; do keyframes need to be removed?
  sequence([
    animate('1s 1.25s ease-in-out',
        keyframes([
          style({border: '#f2f3f400 solid 5px'}),
          style({border: '#5BB314 solid 5px'}),
          style({border: '#f2f3f400 solid 5px'})
        ]),
    ),
    animate('1s 3s ease-in-out',
      keyframes([
        style({border: '#f2f3f400 solid 5px'}),
        style({border: '#5BB314 solid 5px'}),
        style({border: '#f2f3f400 solid 5px'})
      ]),
    ),
    animate('1s 3s ease-in-out',
      keyframes([
        style({border: '#f2f3f400 solid 5px'}),
        style({border: '#5BB314 solid 5px'}),
        style({border: '#f2f3f400 solid 5px'})
      ]),
    ),
    animate('1s 3s ease-in-out',
      keyframes([
        style({border: '#f2f3f400 solid 5px'}),
        style({border: '#5BB314 solid 5px'}),
        style({border: '#f2f3f400 solid 5px'})
      ]),
    ),
    animate('1s 3s ease-in-out',
      keyframes([
        style({border: '#f2f3f400 solid 5px'}),
        style({border: '#5BB314 solid 5px'}),
        style({border: '#f2f3f400 solid 5px'})
      ]),
    )
  ])
]);