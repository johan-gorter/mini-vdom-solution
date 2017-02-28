export interface VNode {
  tagName: string;
  content: string | VNode[] | undefined;
  properties: VNodeProperties;
  element?: HTMLElement;
}

export interface VNodeProperties {
  onclick?: (evt: MouseEvent) => void;
  onkeydown?: (evt: KeyboardEvent) => void;
}

export interface Projector {
  scheduleRender(): void;
}

export let h = (tagName: string, properties: VNodeProperties, content?: string | VNode[]): VNode => {
  return {
    tagName: tagName,
    content: content,
    properties: properties
  };
}

export let append = (element: HTMLElement, render: () => VNode): Projector => {
  let lastVNodeTree = render();
  element.appendChild(create(lastVNodeTree));
  return {
    scheduleRender: () => {
      requestAnimationFrame(() => {
        let nextVNodeTree = render();
        diffAndPatch(nextVNodeTree, lastVNodeTree);
        lastVNodeTree = nextVNodeTree;
      });
    }
  };
}

let create = (vnode: VNode): HTMLElement => {
  let result = document.createElement(vnode.tagName);
  vnode.element = result;
  if (typeof vnode.content === 'string') {
    result.textContent = vnode.content;
  } else if (vnode.content) {
    vnode.content.forEach(childVnode => result.appendChild(create(childVnode)));
  }
  if (vnode.properties.onclick) {
    result.onclick = vnode.properties.onclick;
  }
  if (vnode.properties.onkeydown) {
    result.onkeydown = vnode.properties.onkeydown;
  }
  return result;
}

let diffAndPatch = (newTree: VNode, oldTree: VNode) => {
  let element = newTree.element = oldTree.element!;
  // handle text content
  if (typeof newTree.content === 'string') {
    if (oldTree.content !== newTree.content) {
      element.textContent = newTree.content;
    }
  } else if (newTree.content !== undefined) {
    // content is an array of children
    if (!Array.isArray(oldTree.content)) {
      throw new Error('Not supported');
    }
    let oldChildren = oldTree.content;
    let newChildren = newTree.content;
    let oldIndex = 0;
    let newIndex = 0;
    while (newIndex < newChildren.length) {
      let oldChild = oldChildren[oldIndex];
      let newChild = newChildren[newIndex];

      // Same
      if (same(newChild, oldChild)) {
        diffAndPatch(newChild, oldChild);
        oldIndex++;
      } else {
        // TODO: Different, nodes were removed
        // let findOldIndex = findIndexOfChild(oldChildren, newChild, oldIndex + 1);
        // if (findOldIndex >= 0) { Remove preceding missing children ; oldIndex = findOldIndex + 1; } else

        // Different, new node was inserted
        element.insertBefore(create(newChild), oldChild ? oldChild.element! : null);
      }
      newIndex++;
    }
    // remove remaining nodes that are no longer present
    while(oldIndex < oldChildren.length) {
      let oldChild = oldChildren[oldIndex];
      let oldElement = oldChild.element!;
      oldElement.parentElement!.removeChild(oldElement);
      oldIndex++;
    }
  }
};

let same = (newNode: VNode, oldNode?: VNode) => {
  return oldNode && oldNode.tagName === newNode.tagName;
}