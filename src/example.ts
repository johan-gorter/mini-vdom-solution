import {h, append, Projector} from './mini-vdom';

let projector: Projector;

//data
let todoItems = ['Buy milk', 'Go vote'];

// event handlers
let handleKeydown = (evt: KeyboardEvent) => {
  if (evt.which === 13 /* Enter */) {
    let inputElement = (evt.target as HTMLInputElement);
    todoItems.push(inputElement.value);
    inputElement.value = '';
    projector.scheduleRender();
  }
}

// rendering
let render = () => {

  return h('div', {}, [
    h('ul', {}, todoItems.map((item, index) => {

      let handleDoneClick = (evt: MouseEvent) => {
        evt.preventDefault();
        todoItems.splice(index, 1);
        projector.scheduleRender();
      }

      return h('li', {}, [
        h('button', {onclick: handleDoneClick}, 'Done'),
        h('span', {}, item),
      ])
    })),
    h('input', { onkeydown: handleKeydown })
  ]);
};

// startup
document.addEventListener('DOMContentLoaded', () => {
  projector = append(document.body, render);
});
