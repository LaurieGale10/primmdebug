import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'limitString',
  standalone: true
})
export class LimitStringPipe implements PipeTransform {

  characterLimit: number = 100;

  transform(value: string | null | undefined): string | null {
    if (value) {
      if (value.length >= this.characterLimit) {
        return value.substring(0,this.characterLimit - 3) + "..."
      }
      return value;
    }
    return null;
  }

}
