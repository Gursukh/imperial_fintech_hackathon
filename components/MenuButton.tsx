import Image from "next/image";
import React from "react";

type MenuButtonProps = {
  id: string;
  label: string;
  src?: string;
  selected?: boolean;
  onClick?: (id: string) => void;
  className?: string;
};

export default function MenuButton({ id, label, src = "add.svg", selected = false, onClick, className = "" }: MenuButtonProps) {
  const base = "mb-2 font-medium text-lg flex px-4 py-2 gap-3 rounded-lg ";
  const selectedClasses = selected ? "bg-white/10 text-white" : "bg-white/0 opacity-60 text-white";

  return (
    <button
      className={`${base} ${selectedClasses} ${className} cursor-pointer`}
      onClick={() => onClick?.(id)}
      aria-pressed={selected}
    >
      <Image src={src} alt="" width={20} height={20} />
      {label}
    </button>
  );
}
