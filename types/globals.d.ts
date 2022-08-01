/* when needed to enable jsx */

// declare namespace JSX {
//   declare interface IntrinsicElements {
//     [k: string]: any
//   }
// }

declare class MIDIMessageEvent extends Event {
  data: Uint8Array
  constructor(kind: string, payload?: { data: Uint8Array })
}

// declare interface EventHandler<T, E> {
//   (this: T, event: E & { currentTarget: T }): any
// }

// declare interface HTMLElement {
//   ondragstart: EventHandler<HTMLElement, DragEvent>
//   ondragend: EventHandler<HTMLElement, DragEvent>
// }
