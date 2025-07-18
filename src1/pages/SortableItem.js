


import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const SortableItem = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {/* You can attach the listeners to a smaller area to avoid input conflict */}
      <div {...listeners} className='cursor-move text-gray-500 text-sm mb-2'>
        ⠿ Drag
      </div>
      {children}
    </div>
  );
};
