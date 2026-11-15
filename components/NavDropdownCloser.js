'use client';

import { useEffect } from 'react';

// Closes a menu dropdown (Services, Routes, Towns) as soon as an item in it is picked. Without
// this the menu stays open after the page changes: the clicked link keeps focus and the mouse is
// still over the menu. The dropdown stays shut until the mouse leaves it.
export default function NavDropdownCloser() {
  useEffect(() => {
    function onClick(event) {
      const link = event.target?.closest?.('.nav-dropdown-menu a');
      if (!link) return;
      const dropdown = link.closest('.nav-dropdown');
      if (!dropdown) return;
      dropdown.classList.add('is-closed');
      link.blur();
      const reopen = () => { dropdown.classList.remove('is-closed'); dropdown.removeEventListener('mouseleave', reopen); };
      dropdown.addEventListener('mouseleave', reopen);
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
  return null;
}
