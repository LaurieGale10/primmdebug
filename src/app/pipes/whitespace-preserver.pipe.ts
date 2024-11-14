import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'whitespacePreserver',
  standalone: true
})
@Injectable({
  providedIn: 'root'
})
export class WhitespacePreserverPipe implements PipeTransform {

  transform(doc: string): string {
    return doc.replaceAll("\\t","\t").replaceAll("\\n", "\n").replaceAll(/\n\s/g, '\n');//Needs to remove any trailing spaces after \n's
  }

}