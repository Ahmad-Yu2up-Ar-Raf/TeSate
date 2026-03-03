import { useEffect, useState } from 'react';

export function useCurrentTime() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const hour = now.toLocaleString('id-ID', {
    hour: '2-digit',
    hour12: false,
  });

  const minute = now.toLocaleString('id-ID', {
    minute: '2-digit',
  });

  return {
    hour,
    minute,
    formatted: `${hour}:${minute}`,
  };
}
