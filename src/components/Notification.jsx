import { useEffect, useRef } from 'react';

export default function Notification({ msg, type, onClose }) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const t = setTimeout(() => onCloseRef.current(), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`notification notif-${type}`} role="alert">
      {msg}
    </div>
  );
}
