import { SortableElement } from '../src'

const style = document.createElement('style')
document.head.appendChild(style)
style.textContent = /*css*/ `
x-sortable {
  display: flex;
  flex-flow: column nowrap;
}
button {
  padding: 10px;
  background: #444;
  color: #aaa;
  border: 2px solid #988;
}
`

customElements.define('x-sortable', SortableElement)

const sortable = new SortableElement()

sortable.vertical = true
// sortable.selector = 'button'

const items: any = []

for (let i = 0; i < 10; i++) {
  const btn = document.createElement('button')
  btn.textContent = '' + i
  items.push(btn)
  sortable.appendChild(btn)
}

document.body.appendChild(sortable)

sortable.onsortend = ({ detail: { oldIndex, newIndex } }) => {
  const item = items.splice(oldIndex, 1)[0]
  items.splice(newIndex, 0, item)
  for (const item of items)
    sortable.appendChild(item)
}
