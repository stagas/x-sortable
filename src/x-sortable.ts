import $ from 'sigl'

export interface SortableElement extends $.Element<SortableElement, SortableEvents> {}

export type SortableEvents = {
  sortstart: CustomEvent<{ currentIndex: number }>
  sortend: CustomEvent<{ oldIndex: number; newIndex: number }>
}

export enum SortableState {
  Idle = 'idle',
  Sort = 'sort',
}

@$.element()
export class SortableElement extends HTMLElement {
  root = $(this).shadow(/*html*/ `<slot></slot>`)

  @$.attr() state = $(this).state(SortableState)
  @$.attr() vertical = false

  placeholder?: HTMLElement

  items = $(this).slotted() as HTMLElement[]
  item?: HTMLElement
  // we do `display: none` on the sorting item
  // so this is used to revert it back to its previous value
  itemPrevDisplay?: string

  dragElementImage?: HTMLElement

  onDragStart?: $.EventHandler<HTMLElement, DragEvent>
  onDragEnd?: $.EventHandler<HTMLElement, DragEvent>
  onDragOver?: $.EventHandler<SortableElement, DragEvent>

  mounted($: SortableElement['$']) {
    $.onDragStart = $.reduce(({ items }) =>
      $.when(
        $.state.isIdle,
        $.atomic(e => {
          $.item = e.currentTarget
          $.itemPrevDisplay = $.item.style.display

          $.placeholder = e.currentTarget.cloneNode(true) as HTMLElement

          // TODO: this takes care of the dragging image to be of correct scale
          // but it's overall ugly and so drag n drop needs to be
          // reimplemented from scratch
          const { width, height } = $.item.getBoundingClientRect()
          const node = e.currentTarget.cloneNode(true) as HTMLElement
          const box = e.currentTarget.getBoundingClientRect()

          e.currentTarget.after(node)

          // console.log(e.pageX - box.x)
          // NOTE: This fixes the drag image for items that might exceed the
          // container viewport, but because we're moving them to top left
          // to achieve that, the first child can become inaccessible for drag
          // so we don't apply it there
          if (e.currentTarget !== e.currentTarget.parentElement!.firstChild) {
            node.style.position = 'absolute'
            node.style.zIndex = '999'
            node.style.left = '5px'
            node.style.top = '5px'
          }

          node.style.background = '#000'
          node.style.width = width + 'px'
          node.style.height = height + 'px'

          e.dataTransfer?.setDragImage(node, e.pageX - box.x, e.pageY - box.y)

          requestAnimationFrame(() => {
            node.remove()
          })

          const currentIndex = items.indexOf($.item!)

          $.state.push(SortableState.Sort, { currentIndex })
        })
      )
    )

    $.onDragEnd = $.reduce(({ items }) =>
      $.when(
        $.state.is(SortableState.Sort),
        $.atomic(() => {
          // const items = [...host.querySelectorAll(selector)]
          let oldIndex = items.indexOf($.item!)
          let newIndex = items.indexOf($.placeholder!)

          $.placeholder?.remove()

          $.item!.style.display = $.itemPrevDisplay!

          if (newIndex > oldIndex) newIndex--
          else oldIndex--

          if (newIndex === oldIndex) {
            $.state.cancel(SortableState.Sort)
            return
          }

          $.state.pop(SortableState.Sort, { oldIndex, newIndex })
        })
      ), () => {})

    $.onDragOver = $.reduce(({ item, placeholder }) =>
      $.when(
        $.state.is(SortableState.Sort),
        $.event.prevent(e => {
          const target = e.target as HTMLElement | null
          // if (!target) return

          // target = target.matches(selector) ? target : target.closest(selector)
          if (!target || target === placeholder || !$.items.includes(target)) return

          item.style.display = 'none'

          const targetIndex = $.items.indexOf(target)
          const placeholderIndex = $.items.indexOf(placeholder)

          if (placeholderIndex > targetIndex) {
            if (placeholder !== target.previousElementSibling)
              target.before(placeholder)
            else if (placeholder !== target.nextElementSibling)
              target.after(placeholder)
          } else {
            if (placeholder !== target.nextElementSibling)
              target.after(placeholder)
            else if (placeholder !== target.previousElementSibling)
              target.before(placeholder)
          }
        })
      )
    )

    $.effect(({ items, onDragStart, onDragEnd }) =>
      $.chain(...items.map(el => (
        el.setAttribute('draggable', 'true'), // NOTE: draggable is not a boolean, must be "true" string
          $.chain(
            $.on(el).dragstart(onDragStart),
            $.on(el).dragend(onDragEnd)
          )
      )))
    )

    $.effect(({ host }) => $.on(host).pointerdown.stop())
    $.effect(({ host, onDragOver }) => $.on(host).dragover(onDragOver))
  }
}
