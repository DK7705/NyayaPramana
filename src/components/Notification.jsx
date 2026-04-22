import { useEffect } from 'react';

export default function Notification({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`notification notif-${type}`}>
      {msg}
    </div>
  );
}
