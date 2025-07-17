
import React, { useState } from 'react';

interface DropdownMenuProps {
  children: React.ReactNode;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative inline-block text-left">
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child, { isOpen, setIsOpen } as any)
          : child
      )}
    </div>
  );
};

export const DropdownMenuTrigger: React.FC<{ children: React.ReactNode; isOpen?: boolean; setIsOpen?: (open: boolean) => void }> = ({ 
  children, 
  isOpen, 
  setIsOpen 
}) => {
  return (
    <div onClick={() => setIsOpen?.(!isOpen)} className="cursor-pointer">
      {children}
    </div>
  );
};

export const DropdownMenuContent: React.FC<{ children: React.ReactNode; isOpen?: boolean }> = ({ 
  children, 
  isOpen 
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
      <div className="py-1" role="menu">
        {children}
      </div>
    </div>
  );
};

export const DropdownMenuItem: React.FC<{ children: React.ReactNode; onClick?: () => void }> = ({ 
  children, 
  onClick 
}) => {
  return (
    <div
      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
      role="menuitem"
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const DropdownMenuLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="px-4 py-2 text-sm font-medium text-gray-900">
      {children}
    </div>
  );
};

export const DropdownMenuSeparator: React.FC = () => {
  return <div className="h-px bg-gray-200 my-1" />;
};
